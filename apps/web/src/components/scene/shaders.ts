export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;
uniform vec4 uScene[5];

attribute vec3 aT1;
attribute vec3 aT2;
attribute vec3 aT3;
attribute vec3 aT4;
attribute vec4 aSeed;        // size, phase, twinkle, stagger
attribute vec2 aPulseGraph;  // t along edge, edge phase
attribute vec2 aPulseFlow;   // t along pipeline, lane

varying float vAlpha;
varying float vPulse;

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

  vec3 p = position * w0 + aT1 * w1 + aT2 * w2 + aT3 * w3 + aT4 * w4;
  vec4 sc = uScene[0] * w0 + uScene[1] * w1 + uScene[2] * w2 + uScene[3] * w3 + uScene[4] * w4;
  p += sc.xyz;

  // Idle drift + a swarm-like swirl while in transit between shapes.
  float transit = sin(3.14159265 * fs);
  float ph = aSeed.y;
  p += vec3(sin(ph + uTime * 0.7), cos(ph * 1.3 + uTime * 0.6), sin(ph * 0.7 + uTime * 0.5)) * (0.018 + transit * 0.4);

  // Retrieval pulses along a subset of graph edges.
  float g = 0.0;
  if (aPulseGraph.x >= 0.0 && fract(aPulseGraph.y * 7.13) > 0.62) {
    float head = fract(uTime * 0.18 + aPulseGraph.y);
    float d = head - aPulseGraph.x;
    g = (d >= 0.0 && d < 0.22) ? 1.0 - d / 0.22 : 0.0;
  }
  // Packets travelling through the agent pipeline (lane 1 = tool-call loop).
  float f = 0.0;
  if (aPulseFlow.x >= 0.0) {
    float head = fract(uTime * (0.09 + aPulseFlow.y * 0.05) + aPulseFlow.y * 0.37);
    float d = head - aPulseFlow.x;
    f = (d >= 0.0 && d < 0.07) ? 1.0 - d / 0.07 : 0.0;
  }
  float pulse = g * w0 + f * w3;
  vPulse = pulse;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.72 + 0.28 * sin(uTime * 1.3 + ph * 3.0 + aSeed.z * 6.28);
  gl_PointSize = uSize * aSeed.x * (1.0 + pulse * 1.4) * uPixelRatio / -mv.z;

  float depth = smoothstep(16.0, 4.0, -mv.z);
  vAlpha = sc.w * twinkle * (0.3 + 0.7 * depth);
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
