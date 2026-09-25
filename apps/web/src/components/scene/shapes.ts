/**
 * Target layouts for the particle field. Every scene uses the same N particles;
 * the vertex shader blends between them as the page scrolls.
 *
 *   0 attractor — particles stream along an Aizawa strange attractor (animated in the shader)
 *   1 galaxy    — a tilted three-armed spiral galaxy, turning (animated in the shader)
 *   2 layers    — neural net: dotted layer planes + inter-layer connections
 *   3 warp      — a tunnel of twisting rings streaming toward the viewer (animated in the shader)
 *   4 sphere    — the orb: fibonacci sphere with two orbit rings
 *
 * Scenes 0, 1 and 3 store parameters, not positions: the shader computes where each
 * particle is from time, so those scenes keep moving instead of holding a pose.
 */
export const SCENE_COUNT = 5;

export type SceneBuffers = {
  /** SCENE_COUNT × (N*3). Scene 0: (phase, jitterA, jitterB). Scene 1: (radius, angle, height). Scene 3: (angle, radius, phase). */
  targets: Float32Array[];
  seed: Float32Array; // N*4: size, phase, twinkle, stagger
  flow0: Float32Array; // N*2: comet flag (1 / -1), speed multiplier
  flow3: Float32Array; // N*2: packet flag (1 / -1), speed multiplier
};

/**
 * Integrates the Aizawa attractor with RK4 and packs it as an RGBA float texture
 * (xyz, normalised to a radius of ~1). The shader samples it by phase.
 */
export function buildAttractor(samples = 16384): { data: Float32Array; size: number } {
  const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
  const deriv = (x: number, y: number, z: number): [number, number, number] => [
    (z - b) * x - d * y,
    d * x + (z - b) * y,
    c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x,
  ];
  const dt = 0.01;
  let x = 0.1, y = 0, z = 0;
  for (let i = 0; i < 2000; i++) {
    // settle onto the attractor before recording
    const k = deriv(x, y, z);
    x += k[0] * dt; y += k[1] * dt; z += k[2] * dt;
  }
  const size = Math.ceil(Math.sqrt(samples));
  const data = new Float32Array(size * size * 4);
  const pts: [number, number, number][] = [];
  for (let i = 0; i < size * size; i++) {
    const k1 = deriv(x, y, z);
    const k2 = deriv(x + (k1[0] * dt) / 2, y + (k1[1] * dt) / 2, z + (k1[2] * dt) / 2);
    const k3 = deriv(x + (k2[0] * dt) / 2, y + (k2[1] * dt) / 2, z + (k2[2] * dt) / 2);
    const k4 = deriv(x + k3[0] * dt, y + k3[1] * dt, z + k3[2] * dt);
    x += ((k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt) / 6;
    y += ((k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt) / 6;
    z += ((k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) * dt) / 6;
    pts.push([x, y, z]);
  }
  // Centre it, stand its axis upright (attractor z → world y), scale to radius ~1.
  let cx = 0, cy = 0, cz = 0;
  for (const p of pts) { cx += p[0]; cy += p[1]; cz += p[2]; }
  cx /= pts.length; cy /= pts.length; cz /= pts.length;
  let r = 0;
  for (const p of pts) r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz));
  pts.forEach((p, i) => {
    data[i * 4] = (p[0] - cx) / r;
    data[i * 4 + 1] = (p[2] - cz) / r;
    data[i * 4 + 2] = (p[1] - cy) / r;
    data[i * 4 + 3] = 1;
  });
  return { data, size };
}

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

  /* ---------------- 0 · strange attractor ---------------- */
  // Particles are spread evenly along the trajectory; the shader advances their phase.
  for (let i = 0; i < n; i++) {
    put(0, i, [i / n + r() * 0.0004, gauss() * 0.018, gauss() * 0.018]);
    const comet = r() < 0.012;
    flow0[i * 2] = comet ? 1 : -1;
    flow0[i * 2 + 1] = comet ? 3 + r() * 2 : 1;
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

  return { targets, seed, flow0, flow3 };
}
