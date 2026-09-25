/**
 * Target layouts for the particle field. Every scene uses the same N particles;
 * the vertex shader blends between these buffers as the page scrolls.
 *
 *   0 graph     — knowledge graph: hub nodes + dotted edges (retrieval pulses)
 *   1 clusters  — embedding space: soft semantic clusters
 *   2 layers    — neural net: dotted layer planes + inter-layer connections
 *   3 pipeline  — agent workflow: nodes, a human checkpoint, a tool-call loop
 *   4 sphere    — the orb: fibonacci sphere with two orbit rings
 */
export const SCENE_COUNT = 5;

export type SceneBuffers = {
  targets: Float32Array[]; // SCENE_COUNT × (N*3)
  seed: Float32Array; // N*4: size, phase, twinkle, stagger
  pulseGraph: Float32Array; // N*2: t along edge (-1 = none), edge phase
  pulseFlow: Float32Array; // N*2: t along pipeline (-1 = none), lane
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
  const pulseGraph = new Float32Array(n * 2).fill(-1);
  const pulseFlow = new Float32Array(n * 2).fill(-1);

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

  /* ---------------- 0 · knowledge graph ---------------- */
  {
    const hubs: V3[] = [];
    for (let h = 0; h < 46; h++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rad = Math.cbrt(r());
      const s = Math.sqrt(1 - u * u);
      hubs.push([s * Math.cos(th) * 3.1 * rad, u * 2.1 * rad, s * Math.sin(th) * 1.8 * rad]);
    }
    const edges: [number, number][] = [];
    const seen = new Set<string>();
    hubs.forEach((a, ai) => {
      const near = hubs
        .map((b, bi) => ({ bi, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 }))
        .filter((x) => x.bi !== ai)
        .sort((x, y) => x.d - y.d)
        .slice(0, r() < 0.3 ? 3 : 2);
      for (const { bi } of near) {
        const k = ai < bi ? `${ai}-${bi}` : `${bi}-${ai}`;
        if (!seen.has(k)) {
          seen.add(k);
          edges.push([ai, bi]);
        }
      }
    });
    const hubShare = Math.floor(n * 0.28);
    for (let i = 0; i < n; i++) {
      if (i < hubShare) {
        const h = hubs[i % hubs.length];
        const big = i % hubs.length < 8 ? 0.13 : 0.07; // a few "important" entities
        put(0, i, jitter(h, big));
      } else {
        const ei = i % edges.length;
        const [a, b] = edges[ei];
        const t = r();
        put(0, i, jitter(lerp3(hubs[a], hubs[b], t), 0.012));
        pulseGraph[i * 2] = t;
        pulseGraph[i * 2 + 1] = (ei * 0.6180339) % 1;
      }
    }
  }

  /* ---------------- 1 · embedding clusters ---------------- */
  {
    const centers: V3[] = Array.from({ length: 7 }, (_, k) => {
      const a = (k / 7) * Math.PI * 2 + r() * 0.4;
      return [Math.cos(a) * 1.7, (r() - 0.5) * 2.4, Math.sin(a) * 1.1];
    });
    for (let i = 0; i < n; i++) {
      if (r() < 0.04) {
        put(1, i, [(r() - 0.5) * 4.5, (r() - 0.5) * 3.5, (r() - 0.5) * 2]);
      } else {
        const c = centers[i % centers.length];
        const spread = 0.11 + (i % centers.length) * 0.022;
        put(1, i, jitter(c, spread));
      }
    }
  }

  /* ---------------- 2 · neural layers ---------------- */
  {
    const layers = [
      { x: -2.7, rows: 10, h: 2.8 },
      { x: -0.9, rows: 14, h: 3.4 },
      { x: 0.9, rows: 14, h: 3.4 },
      { x: 2.7, rows: 6, h: 1.8 },
    ];
    const lattice = layers.map((l) => {
      const pts: V3[] = [];
      for (let a = 0; a < l.rows; a++)
        for (let b = 0; b < l.rows; b++)
          pts.push([l.x, (a / (l.rows - 1) - 0.5) * l.h, (b / (l.rows - 1) - 0.5) * l.h * 0.6]);
      return pts;
    });
    const planeShare = Math.floor(n * 0.55);
    for (let i = 0; i < n; i++) {
      if (i < planeShare) {
        const l = lattice[i % lattice.length];
        put(2, i, jitter(l[Math.floor(r() * l.length)], 0.008));
      } else {
        const li = Math.floor(r() * (lattice.length - 1));
        const a = lattice[li][Math.floor(r() * lattice[li].length)];
        const b = lattice[li + 1][Math.floor(r() * lattice[li + 1].length)];
        put(2, i, lerp3(a, b, r()));
      }
    }
  }

  /* ---------------- 3 · agent pipeline ---------------- */
  {
    const nodeCount = 6;
    const checkpoint = 3; // human-in-the-loop
    const nodes: V3[] = Array.from({ length: nodeCount }, (_, k) => {
      const x = -3.6 + (k / (nodeCount - 1)) * 7.2;
      return [x, Math.sin(k * 1.1) * 0.55, Math.cos(k * 0.9) * 0.4];
    });
    const loopTop = (t: number): V3 => {
      // tool-call arc from node 1 to node 4
      const a = nodes[1];
      const b = nodes[4];
      const p = lerp3(a, b, t);
      return [p[0], p[1] + Math.sin(t * Math.PI) * 1.6, p[2] - Math.sin(t * Math.PI) * 0.6];
    };
    const ringShare = Math.floor(n * 0.36);
    const pathShare = Math.floor(n * 0.46);
    for (let i = 0; i < n; i++) {
      if (i < ringShare) {
        const k = i % nodeCount;
        const c = nodes[k];
        const th = r() * Math.PI * 2;
        if (k === checkpoint) {
          // diamond outline
          const q = (th / (Math.PI * 2)) * 4;
          const side = Math.floor(q);
          const f = q - side;
          const corners: [number, number][] = [[0, 0.42], [0.42, 0], [0, -0.42], [-0.42, 0]];
          const p0 = corners[side];
          const p1 = corners[(side + 1) % 4];
          put(3, i, jitter([c[0] + p0[0] + (p1[0] - p0[0]) * f, c[1] + p0[1] + (p1[1] - p0[1]) * f, c[2]], 0.01));
        } else {
          const rad = 0.3 + (r() < 0.25 ? 0.12 : 0);
          put(3, i, jitter([c[0] + Math.cos(th) * rad, c[1] + Math.sin(th) * rad, c[2]], 0.01));
        }
      } else if (i < ringShare + pathShare) {
        const seg = Math.floor(r() * (nodeCount - 1));
        const t = r();
        put(3, i, jitter(lerp3(nodes[seg], nodes[seg + 1], t), 0.01));
        pulseFlow[i * 2] = (seg + t) / (nodeCount - 1);
        pulseFlow[i * 2 + 1] = 0;
      } else {
        const t = r();
        put(3, i, jitter(loopTop(t), 0.012));
        pulseFlow[i * 2] = t;
        pulseFlow[i * 2 + 1] = 1;
      }
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

  return { targets, seed, pulseGraph, pulseFlow };
}
