/**
 * Target layouts for the particle field. Every scene uses the same N particles;
 * the vertex shader blends between them as the page scrolls.
 *
 *   0 big bang  — a nebula that detonates from a single point on load, then breathes (shader-animated)
 *   1 galaxy    — a tilted three-armed spiral galaxy, turning (animated in the shader)
 *   2 network   — a fully connected 5-8-8-3 net; a forward-pass wave sweeps through it (shader-animated)
 *   3 warp      — a tunnel of twisting rings streaming toward the viewer (animated in the shader)
 *   4 sphere    — the orb: fibonacci sphere with two orbit rings
 *   5 graph     — a knowledge graph: entity clusters, dotted relations, retrieval pulses (GraphMind)
 *
 * Scenes 0, 1 and 3 store parameters, not positions: the shader computes where each
 * particle is from time, so those scenes keep moving instead of holding a pose.
 */
export const SCENE_COUNT = 6;

export type SceneBuffers = {
  /** SCENE_COUNT × (N*3). Scene 0: nebula rest position. Scene 1: (radius, angle, height). Scene 3: (angle, radius, phase). */
  targets: Float32Array[];
  seed: Float32Array; // N*4: size, phase, twinkle, stagger
  flow0: Float32Array; // N*2: hot-spot flag (1 / -1), ejecta flag (1 / -1)
  flow2: Float32Array; // N*2: depth through the net (0..1), edge weight (>0) or -activation (<0, neuron)
  flow3: Float32Array; // N*2: packet flag (1 / -1), speed multiplier
  flow5: Float32Array; // N*2: relation (t, phase) or entity (-1 - glowPhase, sizeFactor)
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V3 = [number, number, number];

export function buildScenes(n: number): SceneBuffers {
  const r = rng(20260925);
  const gauss = () => {
    const u = Math.max(r(), 1e-6);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  };

  const targets = Array.from({ length: SCENE_COUNT }, () => new Float32Array(n * 3));
  const seed = new Float32Array(n * 4);
  const flow0 = new Float32Array(n * 2).fill(-1);
  const flow2 = new Float32Array(n * 2).fill(-1);
  const flow3 = new Float32Array(n * 2).fill(-1);
  const flow5 = new Float32Array(n * 2).fill(-1);

  for (let i = 0; i < n; i++) {
    seed[i * 4] = 0.55 + r() * 0.9;
    seed[i * 4 + 1] = r() * Math.PI * 2;
    seed[i * 4 + 2] = r();
    seed[i * 4 + 3] = r();
  }

  const put = (s: number, i: number, p: V3) => {
    targets[s][i * 3] = p[0];
    targets[s][i * 3 + 1] = p[1];
    targets[s][i * 3 + 2] = p[2];
  };
  const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const jitter = (p: V3, s: number): V3 => [p[0] + gauss() * s, p[1] + gauss() * s, p[2] + gauss() * s];

  /* ---------------- 0 · nebula (big bang) ---------------- */
  // Rest shape after the explosion: a filamentary shell, an inner haze and outward ejecta rays.
  // The shader animates the detonation by scaling these positions from the centre.
  {
    const wobble = (x: number, y: number, z: number) =>
      Math.sin(x * 3.1 + y * 1.7) * 0.5 + Math.sin(y * 4.3 - z * 2.9) * 0.3 + Math.sin(z * 5.7 + x * 2.3) * 0.2;
    for (let i = 0; i < n; i++) {
      // random direction on the sphere
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const sq = Math.sqrt(1 - u * u);
      const d: V3 = [sq * Math.cos(th), u, sq * Math.sin(th)];
      const w = wobble(d[0] * 2, d[1] * 2, d[2] * 2);
      const kind = r();
      let rad: number;
      if (kind < 0.6) rad = 1.55 + w * 0.32 + gauss() * 0.05; // filamentary shell
      else if (kind < 0.86) rad = Math.abs(gauss()) * 0.55; // inner haze
      else rad = 1.9 + Math.pow(r(), 1.8) * 1.5; // ejecta rays
      put(0, i, [d[0] * rad, d[1] * rad * 0.92, d[2] * rad]);
      flow0[i * 2] = kind < 0.6 && w > 0.55 && r() < 0.45 ? 1 : -1; // ember hot spots on the densest filaments
      flow0[i * 2 + 1] = kind >= 0.86 ? 1 : -1;
    }
  }

  /* ---------------- 1 · spiral galaxy ---------------- */
  // Stored in the galaxy's own plane: (radius, angle, height). The shader tilts and turns it.
  {
    const arms = 3;
    for (let i = 0; i < n; i++) {
      const kind = r();
      if (kind < 0.16) {
        // bulge: a dense, slightly flattened core
        const rad = Math.abs(gauss()) * 0.32;
        put(1, i, [rad, r() * Math.PI * 2, gauss() * 0.12]);
      } else if (kind < 0.9) {
        // arms: logarithmic spirals, scatter widening with radius
        const rad = 0.3 + Math.pow(r(), 0.85) * 2.2;
        const arm = Math.floor(r() * arms);
        const angle = (arm / arms) * Math.PI * 2 + Math.log(rad) * 2.4 + gauss() * (0.16 + rad * 0.07);
        put(1, i, [rad, angle, gauss() * 0.05 * (1.2 - rad / 3)]);
      } else {
        // halo: faint stars between the arms
        const rad = 0.4 + r() * 2.6;
        put(1, i, [rad, r() * Math.PI * 2, gauss() * 0.18]);
      }
    }
  }

  /* ---------------- 2 · neural network ---------------- */
  // A classic fully connected net drawn in dots: neurons are small rings, every connection an
  // evenly spaced dotted line. flow2 carries each dot's depth through the net plus its edge
  // weight (or neuron activation), so the shader can sweep a forward pass through it.
  {
    const counts = [5, 8, 8, 3];
    const xs = [-2.8, -0.95, 0.95, 2.8];
    const gap = 0.63;
    const neurons = counts.map((c, l) => Array.from({ length: c }, (_, k) => [xs[l], (k - (c - 1) / 2) * gap, (r() - 0.5) * 0.35] as V3));
    const edges: { a: V3; b: V3; layer: number; weight: number }[] = [];
    for (let l = 0; l < 3; l++)
      for (const a of neurons[l]) for (const b of neurons[l + 1]) edges.push({ a, b, layer: l, weight: Math.pow(r(), 1.6) * 0.9 + 0.1 });
    const all = neurons.flatMap((layer, l) => layer.map((p) => ({ p, depth: l / 3, activation: 0.3 + r() * 0.7 })));
    const perNeuron = 40;
    const neuronDots = all.length * perNeuron;
    const perEdge = Math.floor((n - neuronDots) / edges.length);
    for (let i = 0; i < n; i++) {
      if (i < neuronDots) {
        const nr = all[Math.floor(i / perNeuron)];
        const u = r() * 2 - 1, th = r() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
        const rad = i % perNeuron < 8 ? r() * 0.03 : 0.085;
        put(2, i, [nr.p[0] + sq * Math.cos(th) * rad, nr.p[1] + u * rad, nr.p[2] + sq * Math.sin(th) * rad]);
        flow2[i * 2] = nr.depth;
        flow2[i * 2 + 1] = -nr.activation;
      } else {
        const j = i - neuronDots;
        const e = edges[Math.min(edges.length - 1, Math.floor(j / Math.max(1, perEdge)))];
        const t = ((j % Math.max(1, perEdge)) + 0.5) / Math.max(1, perEdge);
        put(2, i, lerp3(e.a, e.b, 0.06 + t * 0.88));
        flow2[i * 2] = (e.layer + t) / 3;
        flow2[i * 2 + 1] = e.weight;
      }
    }
  }

  /* ---------------- 3 · warp tunnel ---------------- */
  // Rings of dots stream from a vanishing point toward the viewer; a few streaks and
  // ember packets spiral through faster. Positions come from (angle, radius, phase) in the shader.
  {
    const rings = 20;
    for (let i = 0; i < n; i++) {
      const kind = r();
      const angle = r() * Math.PI * 2;
      if (kind < 0.72) {
        const ring = Math.floor(r() * rings);
        put(3, i, [angle, 1.7 + gauss() * 0.025, ring / rings + gauss() * 0.001]);
      } else {
        put(3, i, [angle, 0.5 + r() * 2.4, r()]);
      }
      const packet = kind > 0.975;
      flow3[i * 2] = packet ? 1 : -1;
      flow3[i * 2 + 1] = packet ? 2.5 + r() * 1.5 : kind < 0.72 ? 1 : 1.6;
    }
  }

  /* ---------------- 4 · orb ---------------- */
  {
    const sphereShare = Math.floor(n * 0.72);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      if (i < sphereShare) {
        const y = 1 - (i / (sphereShare - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        put(4, i, [Math.cos(th) * rad * 1.7, y * 1.7, Math.sin(th) * rad * 1.7]);
      } else {
        const ring = i % 2;
        const th = r() * Math.PI * 2;
        const R = 2.35 + ring * 0.35;
        const tilt = ring ? 0.5 : -0.35;
        const x = Math.cos(th) * R;
        const z = Math.sin(th) * R;
        put(4, i, [x, z * Math.sin(tilt), z * Math.cos(tilt)]);
      }
    }
  }

  /* ---------------- 5 · knowledge graph ---------------- */
  // A wide, fairly flat graph that fills the screen: nodes are spaced apart (Poisson-style),
  // sized by importance (hubs, mid nodes, leaves), and linked to nearby nodes, hubs fanning out
  // further. Node dots carry flow5 = (-1 - glowPhase, sizeFactor); relation dots carry
  // (t along the relation, relation phase) so the shader can run pulses between entities.
  {
    const W = 5.6, H = 3.3;
    const nodes: { p: V3; size: number; kind: 0 | 1 | 2 }[] = [];
    for (let tries = 0; nodes.length < 58 && tries < 6000; tries++) {
      const p: V3 = [(r() * 2 - 1) * W, (r() * 2 - 1) * H, (r() * 2 - 1) * 0.9];
      if (nodes.every((n) => Math.hypot(n.p[0] - p[0], n.p[1] - p[1]) > 0.95)) {
        const k = nodes.length;
        const kind = k < 6 ? 0 : k < 22 ? 1 : 2; // 6 hubs, 16 mid, the rest leaves
        nodes.push({ p, kind, size: kind === 0 ? 2.4 : kind === 1 ? 1.6 : 1 });
      }
    }
    const edges: [number, number, number][] = []; // a, b, length
    const seen = new Set<string>();
    nodes.forEach((n, i) => {
      const fan = n.kind === 0 ? 5 : n.kind === 1 ? 3 : 2;
      const near = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.p[0] - n.p[0], m.p[1] - n.p[1], m.p[2] - n.p[2]) }))
        .filter((x) => x.j !== i && x.d < (n.kind === 0 ? 3.4 : 2.3))
        .sort((x, y) => x.d - y.d)
        .slice(0, fan);
      for (const { j, d } of near) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j, d]);
        }
      }
    });
    // Node dots: a disc per node, dot budget proportional to its area.
    const nodeBudget = Math.floor(n * 0.26);
    const weights = nodes.map((nd) => nd.size * nd.size);
    const wSum = weights.reduce((a2, b2) => a2 + b2, 0);
    let i = 0;
    nodes.forEach((nd, k) => {
      const count = Math.max(6, Math.round((weights[k] / wSum) * nodeBudget));
      const radius = 0.05 * nd.size;
      const phase = (k * 0.618034) % 1;
      for (let c = 0; c < count && i < n; c++, i++) {
        const u = r() * 2 - 1, th = r() * Math.PI * 2, sq = Math.sqrt(1 - u * u), rad = radius * Math.cbrt(r());
        put(5, i, [nd.p[0] + sq * Math.cos(th) * rad, nd.p[1] + u * rad, nd.p[2] + sq * Math.sin(th) * rad]);
        flow5[i * 2] = -1 - phase;
        flow5[i * 2 + 1] = nd.size;
      }
    });
    // Relation dots: evenly spaced, budget proportional to length so dot density is uniform.
    const totalLen = edges.reduce((a2, e) => a2 + e[2], 0);
    const remaining = n - i;
    edges.forEach(([ea, eb, len], ei) => {
      const count = Math.max(4, Math.floor((len / totalLen) * remaining));
      const A = nodes[ea], B = nodes[eb];
      const start = (0.05 * A.size) / len, end = 1 - (0.05 * B.size) / len;
      for (let c = 0; c < count && i < n; c++, i++) {
        const t = (c + 0.5) / count;
        put(5, i, lerp3(A.p, B.p, start + t * (end - start)));
        flow5[i * 2] = t;
        flow5[i * 2 + 1] = (ei * 0.6180339) % 1;
      }
    });
    // Any leftover dots sit on the hubs.
    for (; i < n; i++) {
      const nd = nodes[i % 6];
      put(5, i, jitter(nd.p, 0.05 * nd.size));
      flow5[i * 2] = -1 - (((i % 6) * 0.618034) % 1);
      flow5[i * 2 + 1] = nd.size;
    }
  }

  return { targets, seed, flow0, flow2, flow3, flow5 };
}
