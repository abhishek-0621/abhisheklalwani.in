export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;
uniform vec4 uScene[5];
uniform float uBang;            // seconds since the big bang started (hero intro)
uniform float uKick;            // seconds since the last click shockwave
uniform float uSurge;           // 0..1 during a random flare
uniform float uScroll;          // page scroll, drives network signals

attribute vec3 aT1;             // galaxy: radius, angle, height
attribute vec3 aT2;
attribute vec3 aT3;             // warp: angle, radius, phase
attribute vec3 aT4;
attribute vec4 aSeed;           // size, phase, twinkle, stagger
attribute vec2 aFlow0;          // nebula: hot-spot flag, ejecta flag
attribute vec2 aFlow2;          // network: t along path (-1 = neuron), path phase
attribute vec2 aFlow3;          // warp: packet flag, speed

varying float vAlpha;
varying float vPulse;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  // Per-particle staggered morph so shapes dissolve and re-form organically.
  float fl = floor(uProgress);
  float fr = uProgress - fl;
  float fs = smoothstep(0.0, 1.0, clamp((fr - aSeed.w * 0.4) / 0.6, 0.0, 1.0));
  float pp = fl + fs;

  float w0 = max(0.0, 1.0 - abs(pp));
  float w1 = max(0.0, 1.0 - abs(pp - 1.0));
  float w2 = max(0.0, 1.0 - abs(pp - 2.0));
  float w3 = max(0.0, 1.0 - abs(pp - 3.0));
  float w4 = max(0.0, 1.0 - abs(pp - 4.0));

  // 0 - big bang: a collapsed point detonates, overshoots and settles into the nebula.
  float tb = uBang - 0.45;
  float tp = max(tb, 0.0) * (0.7 + aSeed.w * 0.6);
  float spring = tb < 0.0 ? 0.0 : 1.0 - exp(-4.2 * tp) * cos(7.0 * tp);
  float tk = uKick * (0.8 + aSeed.w * 0.4);
  float kick = 0.4 * exp(-3.2 * tk) * sin(8.0 * tk);
  float breathe = 1.0 + 0.025 * sin(uTime * 0.8 + aSeed.y) + uSurge * 0.1;
  vec3 p0 = position * max(0.0, spring + kick) * breathe;
  p0.xz = rot(uTime * 0.05) * p0.xz;
  float flash = tb < 0.0 ? 0.35 + 0.35 * sin(uTime * 12.0) : exp(-tp * 2.2);
  bool hot = aFlow0.x > 0.0;

  // 1 - galaxy: a rigid slow spin plus a little differential shear, tilted toward the viewer.
  float gAngle = aT1.y + uTime * (0.05 + 0.05 / (aT1.x + 0.6));
  vec3 g = vec3(cos(gAngle) * aT1.x, aT1.z, sin(gAngle) * aT1.x) * 0.95;
  g.yz = rot(-0.5) * g.yz;
  g.xy = rot(0.35) * g.xy;
  vec3 p1 = g;
  bool youngStar = aSeed.z > 0.986 && aT1.x > 0.4;

  // 2 - neural network: turned to show depth; signals run along the connection paths.
  vec3 p2 = aT2;
  p2.xz = rot(0.75) * p2.xz;
  p2.yz = rot(-0.18) * p2.yz;
  float signal = 0.0;
  float fire = 0.0;
  if (aFlow2.x >= 0.0) {
    if (fract(aFlow2.y * 5.37) > 0.4) {
      float head = fract(uScroll + uTime * 0.05 + aFlow2.y);
      float d = head - aFlow2.x;
      signal = (d >= 0.0 && d < 0.1) ? 1.0 - d / 0.1 : 0.0;
    }
  } else {
    // Only a few neurons fire at a time, each briefly.
    fire = smoothstep(0.985, 1.0, sin(uTime * 1.1 + aSeed.y * 9.0));
  }
  float netAlpha = aFlow2.x >= 0.0 ? 0.8 + signal * 1.2 : 1.1 + fire;

  // 3 - warp tunnel: rings rush from the vanishing point toward the viewer, twisting.
  float ph = fract(aT3.z + uTime * 0.035 * aFlow3.y);
  float tz = mix(-22.0, 3.0, ph * ph);
  float twist = aT3.x + tz * 0.09 + uTime * 0.12 * (aFlow3.x > 0.0 ? 2.5 : 1.0);
  float radius = aT3.y * (1.0 + 0.07 * sin(tz * 0.5 - uTime * 1.3));
  vec3 p3 = vec3(cos(twist) * radius, sin(twist) * radius, tz);
  float tunnelFade = smoothstep(0.0, 0.2, ph) * (1.0 - smoothstep(0.82, 1.0, ph));

  vec3 p = p0 * w0 + p1 * w1 + p2 * w2 + p3 * w3 + aT4 * w4;
  vec4 sc = uScene[0] * w0 + uScene[1] * w1 + uScene[2] * w2 + uScene[3] * w3 + uScene[4] * w4;
  p += sc.xyz;

  // Idle drift + a swarm-like swirl while in transit between shapes.
  float transit = sin(3.14159265 * fs);
  float seedPh = aSeed.y;
  p += vec3(sin(seedPh + uTime * 0.7), cos(seedPh * 1.3 + uTime * 0.6), sin(seedPh * 0.7 + uTime * 0.5)) * (0.012 + transit * 0.4);

  float pulse = (hot ? 0.9 + uSurge * 0.6 : 0.0) * w0 + (youngStar ? 0.9 : 0.0) * w1 + (signal + fire * 0.9) * w2 + (aFlow3.x > 0.0 ? 1.0 : 0.0) * w3;
  vPulse = pulse;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.72 + 0.28 * sin(uTime * 1.3 + seedPh * 3.0 + aSeed.z * 6.28);
  float sizeBoost = 1.0 + pulse * 1.3 + flash * 1.6 * w0;
  gl_PointSize = min(uSize * aSeed.x * sizeBoost * uPixelRatio / -mv.z, 7.0 * uPixelRatio);

  float depth = smoothstep(26.0, 4.0, -mv.z);
  float nearFade = smoothstep(0.8, 3.0, -mv.z);
  float core = 1.0 + w1 * smoothstep(0.5, 0.0, aT1.x) * 0.6;
  float bangGlow = 1.0 + flash * 1.5 + uSurge * 0.4;
  vAlpha = sc.w * twinkle * core * (0.3 + 0.7 * depth) * nearFade * mix(1.0, tunnelFade, w3) * mix(1.0, netAlpha, w2) * mix(1.0, bangGlow, w0);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uFg;
uniform vec3 uAccent;

varying float vAlpha;
varying float vPulse;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d);
  vec3 col = mix(uFg, uAccent, clamp(vPulse * 1.5, 0.0, 1.0));
  gl_FragColor = vec4(col, a * vAlpha * (1.0 + vPulse));
}
`;
