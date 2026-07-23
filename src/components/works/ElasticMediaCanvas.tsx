"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type MediaMeasure = {
  id: string;
  src: string;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  radius: number;
  docLeft: number;
  docTop: number;
  variation: number;
};

type ScrollState = {
  target: number;
  current: number;
  previous: number;
  velocity: number;
  shaderVelocity: number;
  hoverId: string | null;
  activeId: string | null;
};

const CONFIG = {
  curveDepth: 86,
  curveAngle: 0.092,
  bendStrength: 0.009,
  stretchStrength: 0.018,
  depthStrength: 18,
  velocityMultiplier: 0.0005,
  velocityClamp: 0.86,
  scrollLerp: 28,
  deformationDamping: 17,
  hoverStrength: 0.1,
  defaultRadius: 7,
  visibilityPadding: 360,
};

const vertexShader = `
  uniform float uVelocity;
  uniform float uHover;
  uniform float uCurveStrength;
  uniform float uBendStrength;
  uniform float uStretchStrength;
  uniform float uDepthStrength;
  uniform float uVariation;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float signedVelocity = clamp(uVelocity, -1.0, 1.0);
    float velocityAmount = abs(signedVelocity);
    float verticalProfile = sin(uv.y * 3.14159265);
    float horizontalProfile = (uv.x - 0.5) * 2.0;
    float secondaryProfile = sin((uv.y + uVariation * 0.04) * 6.2831853) * 0.12;
    float elasticProfile = verticalProfile + secondaryProfile;

    pos.x += signedVelocity * uBendStrength * elasticProfile * (1.0 + abs(horizontalProfile) * 0.22);
    pos.y *= 1.0 + velocityAmount * uStretchStrength * verticalProfile;
    pos.z += velocityAmount * uDepthStrength * verticalProfile;
    pos.z += signedVelocity * uDepthStrength * 0.16 * horizontalProfile * verticalProfile;
    pos.z += uHover * 14.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uImageResolution;
  uniform vec2 uPlaneResolution;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uRadius;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 image, vec2 plane) {
    float imageAspect = image.x / image.y;
    float planeAspect = plane.x / plane.y;
    vec2 cover = uv;
    if (planeAspect > imageAspect) {
      cover.y = (uv.y - 0.5) * (planeAspect / imageAspect) + 0.5;
    } else {
      cover.x = (uv.x - 0.5) * (imageAspect / planeAspect) + 0.5;
    }
    return cover;
  }

  float roundedRectMask(vec2 uv, vec2 size, float radius) {
    vec2 pixel = uv * size;
    vec2 halfSize = size * 0.5;
    vec2 distanceToEdge = abs(pixel - halfSize) - (halfSize - vec2(radius));
    float signedDistance = length(max(distanceToEdge, 0.0)) + min(max(distanceToEdge.x, distanceToEdge.y), 0.0);
    return 1.0 - smoothstep(0.0, 1.4, signedDistance);
  }

  void main() {
    vec2 uv = coverUv(vUv, uImageResolution, uPlaneResolution);
    float roundedMask = roundedRectMask(vUv, uPlaneResolution, uRadius);
    if (roundedMask < 0.01) discard;
    uv.x += clamp(uVelocity, -1.0, 1.0) * (vUv.y - 0.5) * 0.011;
    vec4 color = texture2D(uTexture, uv);
    color.rgb = mix(color.rgb, color.rgb * vec3(1.015, 1.03, 1.055), uHover * 0.16);
    gl_FragColor = vec4(color.rgb, color.a * uOpacity * roundedMask);
  }
`;

const gridVertexShader = `
  uniform vec2 uViewport;
  uniform float uCurveDepth;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float normalizedX = pos.x / max(1.0, uViewport.x * 0.5);
    pos.z -= uCurveDepth * normalizedX * normalizedX;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const gridFragmentShader = `
  uniform float uOpacity;
  varying vec2 vUv;

  float lineMask(float value) {
    float grid = abs(fract(value) - 0.5);
    return 1.0 - smoothstep(0.485, 0.5, grid);
  }

  void main() {
    vec2 gridUv = vUv * vec2(18.0, 10.0);
    float line = max(lineMask(gridUv.x), lineMask(gridUv.y));
    vec3 color = mix(vec3(0.03, 0.11, 0.29), vec3(0.12, 0.39, 0.96), 0.45);
    gl_FragColor = vec4(color, line * uOpacity);
  }
`;

function useMeasuredMedia() {
  const [items, setItems] = useState<MediaMeasure[]>([]);

  useEffect(() => {
    let frame = 0;
    let disposed = false;

    const measure = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-elastic-media]"));
        nodes.forEach((node) => resizeObserver.observe(node));
        setItems(
          nodes.map((node, index) => {
            const rect = node.getBoundingClientRect();
            const radius = Number.parseFloat(getComputedStyle(node).borderTopLeftRadius);
            const cssRadius = Number.isFinite(radius) && radius > 0 ? radius : CONFIG.defaultRadius;
            const measuredRadius = THREE.MathUtils.clamp(cssRadius, 5, 8);
            return {
              id: node.dataset.mediaId ?? `media-${index}`,
              src: node.dataset.mediaSrc ?? "",
              width: rect.width,
              height: rect.height,
              imageWidth: Number(node.dataset.imageWidth ?? rect.width),
              imageHeight: Number(node.dataset.imageHeight ?? rect.height),
              radius: measuredRadius,
              docLeft: rect.left + window.scrollX,
              docTop: rect.top + window.scrollY,
              variation: 0.98 + (index % 5) * 0.012,
            };
          }).filter((item) => item.src && item.width > 2 && item.height > 2),
        );
      });
    };

    const resizeObserver = new ResizeObserver(measure);
    const mutationObserver = new MutationObserver(measure);

    measure();
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });
    window.addEventListener("load", measure, { passive: true });
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  return items;
}

function MediaPlane({ item, scroll }: { item: MediaMeasure; scroll: MutableRefObject<ScrollState> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, item.src);
  const { size } = useThree();

  const geometryArgs = useMemo<[number, number, number, number]>(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 760;
    const subdivisions = mobile ? 14 : 24;
    return [1, 1, subdivisions, subdivisions];
  }, []);

  const material = useMemo(() => {
    const shader = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uImageResolution: { value: new THREE.Vector2(item.imageWidth, item.imageHeight) },
        uPlaneResolution: { value: new THREE.Vector2(item.width, item.height) },
        uVelocity: { value: 0 },
        uHover: { value: 0 },
        uOpacity: { value: 1 },
        uRadius: { value: item.radius },
        uCurveStrength: { value: CONFIG.curveDepth },
        uBendStrength: { value: CONFIG.bendStrength },
        uStretchStrength: { value: CONFIG.stretchStrength },
        uDepthStrength: { value: CONFIG.depthStrength },
        uVariation: { value: item.variation },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
    });
    return shader;
  }, [item.height, item.imageHeight, item.imageWidth, item.radius, item.variation, item.width, texture]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 2;
    material.uniforms.uTexture.value = texture;
    return () => material.dispose();
  }, [material, texture]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const state = scroll.current;
    const top = item.docTop - state.current;
    const x = item.docLeft + item.width / 2 - size.width / 2;
    const y = size.height / 2 - top - item.height / 2;
    const normalizedX = THREE.MathUtils.clamp(x / Math.max(1, size.width / 2), -1.25, 1.25);
    const curveZ = -CONFIG.curveDepth * normalizedX * normalizedX;
    const hoverTarget = state.hoverId === item.id ? 1 : 0;
    const activeTarget = state.activeId === item.id ? 1 : 0;
    const hover = Math.max(hoverTarget, activeTarget);
    const hoverValue = THREE.MathUtils.damp(material.uniforms.uHover.value as number, hover, 14, delta);
    const hiddenByActiveProject = state.activeId && state.activeId !== item.id;

    const visible = top > -item.height - CONFIG.visibilityPadding && top < size.height + item.height + CONFIG.visibilityPadding;
    mesh.visible = visible;
    if (!visible) return;

    mesh.position.set(x, y, curveZ + hoverValue * 32);
    mesh.rotation.y = normalizedX * CONFIG.curveAngle * (1 - hoverValue * 0.46);
    mesh.rotation.x = -state.shaderVelocity * 0.016;
    mesh.scale.set(item.width * (1 + hoverValue * 0.014), item.height * (1 + hoverValue * 0.01), 1);

    material.uniforms.uVelocity.value = state.shaderVelocity;
    material.uniforms.uHover.value = hoverValue;
    material.uniforms.uOpacity.value = THREE.MathUtils.damp(material.uniforms.uOpacity.value as number, hiddenByActiveProject ? 0.16 : 1, 12, delta);
    material.uniforms.uRadius.value = Math.min(item.radius, item.width * 0.5, item.height * 0.5);
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={geometryArgs} />
    </mesh>
  );
}

function CurvedGrid({ scroll }: { scroll: MutableRefObject<ScrollState> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uViewport: { value: new THREE.Vector2(1, 1) },
          uCurveDepth: { value: CONFIG.curveDepth },
          uOpacity: { value: 0.13 },
        },
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    material.uniforms.uViewport.value.set(size.width, size.height);
    material.uniforms.uOpacity.value = THREE.MathUtils.damp(material.uniforms.uOpacity.value as number, 0.13 + Math.abs(scroll.current.shaderVelocity) * 0.045, 8, delta);
    meshRef.current.scale.set(size.width * 1.55, size.height * 1.35, 1);
    meshRef.current.position.z = -160;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[1, 1, 48, 16]} />
    </mesh>
  );
}

function Scene({ items }: { items: MediaMeasure[] }) {
  const scroll = useRef<ScrollState>({
    target: 0,
    current: 0,
    previous: 0,
    velocity: 0,
    shaderVelocity: 0,
    hoverId: null,
    activeId: null,
  });
  const readyRef = useRef(false);
  const { gl } = useThree();

  useEffect(() => {
    const update = () => {
      scroll.current.target = window.scrollY;
    };
    const hover = (event: Event) => {
      scroll.current.hoverId = (event as CustomEvent<string | null>).detail;
    };
    const active = (event: Event) => {
      scroll.current.activeId = (event as CustomEvent<string | null>).detail;
    };

    const initialY = window.scrollY;
    scroll.current.target = initialY;
    scroll.current.current = initialY;
    scroll.current.previous = initialY;
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("works-media-hover", hover);
    window.addEventListener("works-media-active", active);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("works-media-hover", hover);
      window.removeEventListener("works-media-active", active);
    };
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const report = (ready: boolean) => {
      window.dispatchEvent(new CustomEvent("works-media-canvas-health", { detail: ready }));
    };
    const onContextLost = () => {
      readyRef.current = false;
      report(false);
    };
    const onContextRestored = () => {
      readyRef.current = false;
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const state = scroll.current;
    const context = gl.getContext();

    if (!readyRef.current && items.length > 0 && context.drawingBufferWidth > 0 && context.drawingBufferHeight > 0) {
      readyRef.current = true;
      window.dispatchEvent(new CustomEvent("works-media-canvas-health", { detail: true }));
    }

    const frameDelta = Math.min(delta, 0.05);
    state.target = window.scrollY;
    state.current = THREE.MathUtils.damp(state.current, state.target, CONFIG.scrollLerp, frameDelta);
    if (Math.abs(state.current - state.target) < 0.035) {
      state.current = state.target;
    }
    state.velocity = (state.current - state.previous) / Math.max(frameDelta, 1 / 120);
    const normalized = THREE.MathUtils.clamp(state.velocity * CONFIG.velocityMultiplier, -CONFIG.velocityClamp, CONFIG.velocityClamp);
    state.shaderVelocity = THREE.MathUtils.damp(state.shaderVelocity, normalized, CONFIG.deformationDamping, frameDelta);
    state.previous = state.current;
  });

  return (
    <>
      <CurvedGrid scroll={scroll} />
      {items.map((item) => <MediaPlane key={item.id} item={item} scroll={scroll} />)}
    </>
  );
}

export default function ElasticMediaCanvas() {
  const items = useMeasuredMedia();

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 600], zoom: 1, near: 0.1, far: 1200 }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <Scene items={items} />
    </Canvas>
  );
}
