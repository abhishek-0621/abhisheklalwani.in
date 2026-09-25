"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, DataTexture, FloatType, NearestFilter, RGBAFormat, ShaderMaterial, Vector4, type Points } from "three";
import { buildAttractor, buildScenes, SCENE_COUNT } from "./shapes";
import { fragmentShader, vertexShader } from "./shaders";

type Props = {
  count: number;
  /** Changes on route change so section anchors are re-measured. */
  routeKey: string;
  onReady: () => void;
};

type Keyframe = [scroll: number, scene: number];

/** Maps scroll position to a continuous scene index with a hold while each section is on screen. */
function measureKeyframes(): Keyframe[] {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const frames: Keyframe[] = [];
  document.querySelectorAll<HTMLElement>("[data-scene]").forEach((el) => {
    const scene = Number(el.dataset.scene);
    const rect = el.getBoundingClientRect();
    const top = rect.top + y;
    const start = top - vh * 0.45;
    const end = Math.max(start, top + rect.height - vh * 0.85);
    frames.push([start, scene], [end, scene]);
  });
  return frames.sort((a, b) => a[0] - b[0]);
}

function sample(frames: Keyframe[], y: number) {
  if (!frames.length) return 0;
  if (y <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [y1, s1] = frames[i];
    if (y <= y1) {
      const [y0, s0] = frames[i - 1];
      const t = y1 === y0 ? 1 : (y - y0) / (y1 - y0);
      return s0 + (s1 - s0) * t;
    }
  }
  return frames[frames.length - 1][1];
}

function sceneLayout(width: number, height: number) {
  // Side-by-side layouts start at the lg breakpoint (1024px), same as the CSS.
  const wide = width >= 1024 && width / height > 1.1;
  // xyz offset, alpha — keeps shapes clear of the copy they sit behind.
  return wide
    ? [new Vector4(2.4, 0.15, 0, 0.95), new Vector4(-3.1, 0, -0.5, 0.7), new Vector4(0, 0, -1.5, 0.32), new Vector4(-3.2, 0, 0, 0.85), new Vector4(0, 0, -2, 0.42)]
    : [new Vector4(0, 2.5, -1, 0.6), new Vector4(0, 0, -1, 0.35), new Vector4(0, 0, -1.5, 0.22), new Vector4(0, 0, -1, 0.3), new Vector4(0, 0, -1.5, 0.35)];
}

function Field({ count, routeKey, onReady }: Props) {
  const points = useRef<Points>(null);
  const frames = useRef<Keyframe[]>([]);
  const progress = useRef(-1);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const readyFired = useRef(false);
  const { size, camera, gl } = useThree();

  const geometry = useMemo(() => {
    const { targets, seed, flow0, flow3 } = buildScenes(count);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(targets[0], 3));
    for (let s = 1; s < SCENE_COUNT; s++) g.setAttribute(`aT${s}`, new BufferAttribute(targets[s], 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 4));
    g.setAttribute("aFlow0", new BufferAttribute(flow0, 2));
    g.setAttribute("aFlow3", new BufferAttribute(flow3, 2));
    return g;
  }, [count]);

  const material = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => new Color(css.getPropertyValue(name).trim() || fallback);
    const attractor = buildAttractor();
    const attractorTex = new DataTexture(attractor.data, attractor.size, attractor.size, RGBAFormat, FloatType);
    attractorTex.minFilter = attractorTex.magFilter = NearestFilter;
    attractorTex.needsUpdate = true;
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: gl.getPixelRatio() },
        uSize: { value: 15 },
        uScene: { value: sceneLayout(size.width, size.height) },
        uFg: { value: token("--color-fg", "#ededed") },
        uAccent: { value: token("--color-accent", "#ff6a3d") },
        uAttractor: { value: attractorTex },
        uAttractorSize: { value: attractor.size },
      },
    });
    // gl/size are read once here; the layout effect below keeps them current.
  }, []);

  useEffect(() => () => {
    geometry.dispose();
    material.uniforms.uAttractor.value.dispose();
    material.dispose();
  }, [geometry, material]);

  // Viewport-dependent layout + camera distance.
  useEffect(() => {
    const aspect = size.width / size.height;
    material.uniforms.uScene.value = sceneLayout(size.width, size.height);
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    camera.position.z = aspect < 1 ? 7 + (1 - aspect) * 7 : 7;
    camera.updateProjectionMatrix();
  }, [size, camera, gl, material]);

  // Section anchors: re-measured on layout change and route change.
  useEffect(() => {
    const measure = () => (frames.current = measureKeyframes());
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [routeKey]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.uniforms;
    u.uTime.value += dt;

    const target = sample(frames.current, window.scrollY);
    if (progress.current < 0) progress.current = target;
    progress.current += (target - progress.current) * (1 - Math.exp(-dt * 3.2));
    u.uProgress.value = Math.min(SCENE_COUNT - 1, Math.max(0, progress.current));

    const m = mouse.current;
    m.x += (m.tx - m.x) * (1 - Math.exp(-dt * 2.5));
    m.y += (m.ty - m.y) * (1 - Math.exp(-dt * 2.5));
    const p = points.current;
    if (p) {
      const t = state.clock.elapsedTime;
      p.rotation.y = Math.sin(t * 0.07) * 0.35 + m.x * 0.22;
      p.rotation.x = Math.sin(t * 0.05) * 0.08 + m.y * 0.12;
    }

    if (!readyFired.current) {
      readyFired.current = true;
      onReady();
    }
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

export default function ParticleCanvas(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 45, position: [0, 0, 7], near: 0.1, far: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Field {...props} />
    </Canvas>
  );
}
