/**
 * Target layouts for the particle field. Every scene uses the same N particles;
 * the vertex shader blends between them as the page scrolls.
 *
 *   0 big bang  — a nebula that detonates from a single point on load, then breathes (shader-animated)
 *   1 galaxy    — a tilted three-armed spiral galaxy, turning (animated in the shader)
 *   2 network   — a 4-layer neural net: neurons plus dotted connection paths that carry signals
 *   3 warp      — a tunnel of twisting rings streaming toward the viewer (animated in the shader)
 *   4 sphere    — the orb: fibonacci sphere with two orbit rings
 *
 * Scenes 0, 1 and 3 store parameters, not positions: the shader computes where each
 * particle is from time, so those scenes keep moving instead of holding a pose.
 */
export const SCENE_COUNT = 5;

export type SceneBuffers = {
  /** SCENE_COUNT × (N*3). Scene 0: nebula rest position. Scene 1: (radius, angle, height). Scene 3: (angle, radius, phase). */
  targets: Float32Array[];
  seed: Float32Array; // N*4: size, phase, twinkle, stagger
  flow0: Float32Array; // N*2: hot-spot flag (1 / -1), ejecta flag (1 / -1)
  flow2: Float32Array; // N*2: t along a connection path (-1 = neuron), path phase
  flow3: Float32Array; // N*2: packet flag (1 / -1), speed multiplier
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
  // Neurons are tight clusters on a grid per layer; connection paths thread one neuron in every
  // layer (hub neurons are shared, so paths fan in and out). The shader runs signals along them.
  {
    const layers = [
      { x: -2.7, rows: 5, h: 2.4 },
      { x: -0.9, rows: 7, h: 3.2 },
      { x: 0.9, rows: 7, h: 3.2 },
      { x: 2.7, rows: 3, h: 1.4 },
    ];
    const neurons = layers.map((l) => {
      const pts: V3[] = [];
      for (let a = 0; a < l.rows; a++)
        for (let b = 0; b < l.rows; b++) pts.push([l.x, (a / (l.rows - 1) - 0.5) * l.h, (b / (l.rows - 1) - 0.5) * l.h * 0.7]);
      return pts;
    });
    // Hubs: a handful of neurons per layer carry most paths, like strong learned weights.
    const hubs = neurons.map((layer) => layer.filter(() => r() < 0.3));
    const pick = (li: number) => (r() < 0.65 && hubs[li].length ? hubs[li][Math.floor(r() * hubs[li].length)] : neurons[li][Math.floor(r() * neurons[li].length)]);
    const paths = Array.from({ length: 120 }, () => layers.map((_, li) => pick(li)));
    const allNeurons = neurons.flat();
    const neuronShare = Math.floor(n * 0.22);
    for (let i = 0; i < n; i++) {
      if (i < neuronShare) {
        put(2, i, jitter(allNeurons[i % allNeurons.length], 0.028));
      } else {
        const pi = i % paths.length;
        const t = r();
        const seg = Math.min(2, Math.floor(t * 3));
        put(2, i, jitter(lerp3(paths[pi][seg], paths[pi][seg + 1], t * 3 - seg), 0.004));
        flow2[i * 2] = t;
        flow2[i * 2 + 1] = (pi * 0.6180339) % 1;
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

  return { targets, seed, flow0, flow2, flow3 };
}
