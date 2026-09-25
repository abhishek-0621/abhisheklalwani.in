export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;
uniform vec4 uScene[5];
uniform sampler2D uAttractor;
uniform float uAttractorSize;   // texture is size x size samples
uniform float uFlow;            // integrated attractor time: speeds up and slows down at random
uniform float uSurge;           // 0..1 while the flow is rushing

attribute vec3 aT1;             // galaxy: radius, angle, height
attribute vec3 aT2;
attribute vec3 aT3;             // warp: angle, radius, phase
attribute vec3 aT4;
attribute vec4 aSeed;           // size, phase, twinkle, stagger
attribute vec2 aFlow0;          // attractor: comet flag, speed
attribute vec2 aFlow3;          // warp: packet flag, speed

varying float vAlpha;
varying float vPulse;

vec3 attractorAt(float t) {
  float n = uAttractorSize * uAttractorSize;
  float fi = t * (n - 2.0);
  float i0 = floor(fi);
  float i1 = i0 + 1.0;
  vec2 uv0 = (vec2(mod(i0, uAttractorSize), floor(i0 / uAttractorSize)) + 0.5) / uAttractorSize;
  vec2 uv1 = (vec2(mod(i1, uAttractorSize), floor(i1 / uAttractorSize)) + 0.5) / uAttractorSize;
  return mix(texture2D(uAttractor, uv0).xyz, texture2D(uAttractor, uv1).xyz, fi - i0);
}

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

  // 0 - strange attractor: each particle rides the trajectory; comets overtake.
  bool comet = aFlow0.x > 0.0;
  // Each stream has its own pace (seeded), so surges shear the flow apart.
  float lane = 0.7 + aSeed.w * 0.6;
  float t0 = fract(position.x + uFlow * 0.0035 * aFlow0.y * lane);
  vec3 p0 = attractorAt(t0) * 1.6 + vec3(position.y, position.z, (aSeed.z - 0.5) * 0.03);
  p0.xz = rot(uTime * 0.06) * p0.xz;

  // 1 - galaxy: a rigid slow spin plus a little differential shear, tilted toward the viewer.
  float gAngle = aT1.y + uTime * (0.05 + 0.05 / (aT1.x + 0.6));
  vec3 g = vec3(cos(gAngle) * aT1.x, aT1.z, sin(gAngle) * aT1.x) * 0.95;
  g.yz = rot(-0.5) * g.yz;
  g.xy = rot(0.35) * g.xy;
  vec3 p1 = g;
  bool youngStar = aSeed.z > 0.986 && aT1.x > 0.4;

  // 3 - warp tunnel: rings rush from the vanishing point toward the viewer, twisting.
  float ph = fract(aT3.z + uTime * 0.035 * aFlow3.y);
  float tz = mix(-22.0, 3.0, ph * ph);
  float twist = aT3.x + tz * 0.09 + uTime * 0.12 * (aFlow3.x > 0.0 ? 2.5 : 1.0);
  float radius = aT3.y * (1.0 + 0.07 * sin(tz * 0.5 - uTime * 1.3));
  vec3 p3 = vec3(cos(twist) * radius, sin(twist) * radius, tz);
  float tunnelFade = smoothstep(0.0, 0.2, ph) * (1.0 - smoothstep(0.82, 1.0, ph));

  vec3 p = p0 * w0 + p1 * w1 + aT2 * w2 + p3 * w3 + aT4 * w4;
  vec4 sc = uScene[0] * w0 + uScene[1] * w1 + uScene[2] * w2 + uScene[3] * w3 + uScene[4] * w4;
  p += sc.xyz;

  // Idle drift + a swarm-like swirl while in transit between shapes.
  float transit = sin(3.14159265 * fs);
  float seedPh = aSeed.y;
  p += vec3(sin(seedPh + uTime * 0.7), cos(seedPh * 1.3 + uTime * 0.6), sin(seedPh * 0.7 + uTime * 0.5)) * (0.012 + transit * 0.4);

  float pulse = (comet ? 1.0 + uSurge * 0.8 : 0.0) * w0 + (youngStar ? 0.9 : 0.0) * w1 + (aFlow3.x > 0.0 ? 1.0 : 0.0) * w3;
  vPulse = pulse;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.72 + 0.28 * sin(uTime * 1.3 + seedPh * 3.0 + aSeed.z * 6.28);
  float sizeBoost = 1.0 + pulse * 1.3;
  gl_PointSize = min(uSize * aSeed.x * sizeBoost * uPixelRatio / -mv.z, 7.0 * uPixelRatio);

  float depth = smoothstep(26.0, 4.0, -mv.z);
  float nearFade = smoothstep(0.8, 3.0, -mv.z);
  float core = 1.0 + w1 * smoothstep(0.5, 0.0, aT1.x) * 0.6;
  vAlpha = sc.w * twinkle * core * (0.3 + 0.7 * depth) * nearFade * mix(1.0, tunnelFade, w3);
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
