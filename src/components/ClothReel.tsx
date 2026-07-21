"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./cubeiq.module.css";

type ClothReelProps = {
  originSelector: string;
  targetSelector: string;
  stackSelector: string;
  src: string;
  poster: string;
};

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uVelocity;
  uniform float uTime;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    vUv = uv;
    vec3 p = position;
    float phase = sin(uProgress * 3.14159265);
    float edge = sin(uv.x * 3.14159265);
    float fold = sin((uv.y * 2.0 - 0.18) * 3.14159265);
    float ripple = sin(uv.x * 7.4 + uv.y * 4.2 + uTime * 0.7);
    float cornerDistance = clamp(length(vec2(uv.x, uv.y)) / 1.4142, 0.0, 1.0);
    float releasedCloth = smoothstep(0.035, 1.0, cornerDistance);
    float heldCorner = 1.0 - smoothstep(0.0, 0.2, cornerDistance);

    p.x += releasedCloth * phase * (0.085 + abs(uVelocity) * 0.045) * (0.38 + uv.y * 0.62);
    p.y += releasedCloth * phase * 0.028 * edge * (0.5 + uv.x * 0.5);
    p.y += releasedCloth * phase * 0.022 * sin(uv.x * 3.14159265);
    p.x -= heldCorner * phase * 0.022;
    p.y -= heldCorner * phase * 0.020;
    p.z += (fold * 0.18 + ripple * 0.025) * phase * edge * releasedCloth;
    p.z += uVelocity * uv.y * 0.18 * releasedCloth;

    vShade = clamp(0.82 + p.z * 0.38 + ripple * phase * 0.035, 0.56, 1.08);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    vec2 coverUv = vUv;
    if (!gl_FrontFacing) coverUv.x = 1.0 - coverUv.x;
    vec4 color = texture2D(uTexture, coverUv);
    float backShade = !gl_FrontFacing ? 0.68 : 1.0;
    color.rgb *= vShade * backShade;

    float radius = 0.055;
    vec2 rounded = abs(vUv - 0.5) - vec2(0.5 - radius);
    float edgeDistance = length(max(rounded, 0.0)) + min(max(rounded.x, rounded.y), 0.0) - radius;
    float roundedMask = 1.0 - smoothstep(-0.003, 0.009, edgeDistance);
    float rim = 1.0 - smoothstep(0.002, 0.018, abs(edgeDistance));
    color.rgb = mix(color.rgb, vec3(1.0), rim * 0.16);
    gl_FragColor = vec4(color.rgb, color.a * uOpacity * roundedMask);
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function smootherstep(value: number) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function getFrame(a: DOMRect, b: DOMRect, progress: number) {
  const sizeProgress = smootherstep(progress);
  const positionProgress = smootherstep((progress - 0.12) / 0.88);
  const width = mix(a.width, b.width, sizeProgress);
  const height = mix(a.height, b.height, sizeProgress);
  const left = mix(a.left, b.left, positionProgress);
  const top = mix(a.top, b.top, positionProgress);
  return { width, height, left, top, centerX: left + width / 2, centerY: top + height / 2, sizeProgress };
}

function readProgress(stack: HTMLElement) {
  const pinnedProgress = Number(stack.dataset.clothProgress);
  if (Number.isFinite(pinnedProgress)) return clamp01(pinnedProgress);
  const rect = stack.getBoundingClientRect();
  const distance = Math.max(1, stack.offsetHeight - window.innerHeight);
  return clamp01(-rect.top / distance);
}

export default function ClothReel({ originSelector, targetSelector, stackSelector, src, poster }: ClothReelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const fallback = fallbackRef.current;
    const origin = document.querySelector<HTMLElement>(originSelector);
    const target = document.querySelector<HTMLElement>(targetSelector);
    const stack = document.querySelector<HTMLElement>(stackSelector);
    if (!canvas || !video || !fallback || !origin || !target || !stack) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let destroyed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let texture: THREE.Texture | null = null;
    let posterTexture: THREE.Texture | null = null;
    let stackNearViewport = true;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        stackNearViewport = entry.isIntersecting;
        canvas.style.visibility = stackNearViewport ? "visible" : "hidden";
        if (stackNearViewport) video.play().catch(() => undefined);
        else video.pause();
      },
      { rootMargin: "320px 0px" },
    );
    visibilityObserver.observe(stack);

    const positionFallback = (progress: number) => {
      const a = origin.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const view = getFrame(a, b, progress);
      fallback.style.left = `${view.left}px`;
      fallback.style.top = `${view.top}px`;
      fallback.style.width = `${view.width}px`;
      fallback.style.height = `${view.height}px`;
      fallback.style.borderRadius = `${mix(16, 30, view.sizeProgress)}px`;
      fallback.style.opacity = progress > 0.01 && progress < 0.995 ? "1" : "0";
      fallback.style.transform = `rotate(${Math.sin(progress * Math.PI) * -0.5}deg)`;
    };

    let fallbackCurrent = 0;
    let fallbackLastTime = performance.now();
    const fallbackFrame = (now: number) => {
      const delta = Math.min(32, now - fallbackLastTime) / 16.67;
      fallbackCurrent += (readProgress(stack) - fallbackCurrent) * (1 - Math.pow(0.9, delta));
      fallbackLastTime = now;
      positionFallback(fallbackCurrent);
      frame = requestAnimationFrame(fallbackFrame);
    };

    if (reduce || coarse) {
      fallback.dataset.active = "true";
      frame = requestAnimationFrame(fallbackFrame);
      return () => {
        cancelAnimationFrame(frame);
        visibilityObserver.disconnect();
      };
    }

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch {
      fallback.dataset.active = "true";
      frame = requestAnimationFrame(fallbackFrame);
      return () => {
        cancelAnimationFrame(frame);
        visibilityObserver.disconnect();
      };
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.z = 3;
    geometry = new THREE.PlaneGeometry(1, 1, 42, 30);

    texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        uTexture: { value: texture },
        uProgress: { value: 0 },
        uVelocity: { value: 0 },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    fallback.dataset.active = "false";

    new THREE.TextureLoader().load(
      poster,
      (loaded) => {
        posterTexture = loaded;
        posterTexture.colorSpace = THREE.SRGBColorSpace;
      },
      undefined,
      () => undefined,
    );

    const handleVideoError = () => {
      if (material && posterTexture) material.uniforms.uTexture.value = posterTexture;
      fallback.dataset.videoFailed = "true";
    };
    video.addEventListener("error", handleVideoError);

    let current = 0;
    let previous = 0;
    let lastTime = performance.now();

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer?.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    };

    const render = (now: number) => {
      if (destroyed || !renderer || !material) return;
      if (!stackNearViewport) {
        frame = requestAnimationFrame(render);
        return;
      }

      const desired = readProgress(stack);
      const delta = Math.min(32, now - lastTime) / 16.67;
      current += (desired - current) * (1 - Math.pow(0.9, delta));
      const velocity = THREE.MathUtils.lerp(material.uniforms.uVelocity.value, current - previous, 0.12);
      previous = current;
      lastTime = now;

      const a = origin.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const view = getFrame(a, b, current);
      const { width, height, centerX, centerY } = view;
      const phase = Math.sin(current * Math.PI);

      mesh.position.set(centerX - window.innerWidth / 2, window.innerHeight / 2 - centerY, 0);
      mesh.scale.set(width, height, 1);
      mesh.rotation.z = phase * -0.035;
      mesh.rotation.x = phase * 0.018;
      material.uniforms.uProgress.value = current;
      material.uniforms.uVelocity.value = THREE.MathUtils.clamp(velocity * 28, -1, 1);
      material.uniforms.uTime.value = now / 1000;
      const targetOpacity = current > 0.015 && current < 0.995 ? 1 : 0;
      material.uniforms.uOpacity.value = THREE.MathUtils.lerp(material.uniforms.uOpacity.value, targetOpacity, 0.14);

      const borderRadius = `${mix(16, 30, view.sizeProgress)}px`;
      const padX = width * 0.2 + 36;
      const padY = height * 0.6 + 42;
      const clipTop = Math.max(0, centerY - height / 2 - padY);
      const clipRight = Math.max(0, window.innerWidth - (centerX + width / 2 + padX));
      const clipBottom = Math.max(0, window.innerHeight - (centerY + height / 2 + padY));
      const clipLeft = Math.max(0, centerX - width / 2 - padX);
      canvas.style.borderRadius = borderRadius;
      canvas.style.clipPath = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round ${borderRadius})`;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    resize();
    video.play().catch(() => undefined);
    canvas.dataset.ready = "true";
    window.addEventListener("resize", resize, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      window.removeEventListener("resize", resize);
      video.removeEventListener("error", handleVideoError);
      video.pause();
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      posterTexture?.dispose();
      renderer?.dispose();
    };
  }, [originSelector, poster, src, stackSelector, targetSelector]);

  return (
    <div className={styles.clothReel} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.clothCanvas} />
      <div ref={fallbackRef} className={styles.clothFallback}>
        <img src={poster} alt="" />
        <video ref={videoRef} muted loop autoPlay playsInline preload="metadata" crossOrigin="anonymous" poster={poster} suppressHydrationWarning>
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <div className={styles.clothLabel}>CubeIT / systems in motion</div>
    </div>
  );
}
