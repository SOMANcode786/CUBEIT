"use client";

import {
  forwardRef,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

export type CubeIQSceneProps = {
  mode: "hero" | "system" | "final";
  progress: MutableRefObject<number>;
  velocity: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  active: boolean;
  reducedMotion: boolean;
};

type Transform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
};

type MediaPlaneProps = {
  src: string;
  scale?: [number, number];
  opacity?: number;
  bend?: number;
  velocity?: number;
  time?: number;
  contrast?: number;
};

const IMAGE_ASSETS = [
  "/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg",
  "/cubeiq-assets/1981-digital-bf9sZBcGQl4-unsplash.jpg",
  "/cubeiq-assets/austin-distel-EMPZ7yRZoGw-unsplash.jpg",
  "/cubeiq-assets/swello-9Zx0ZeiJ6x4-unsplash.jpg",
  "/cubeiq-assets/brian-j-tromp-T5Us4Q9JMZk-unsplash.jpg",
  "/cubeiq-assets/surface-1shdfk7mQzw-unsplash.jpg",
];

const ICON_ASSETS = [
  "/cubeiq-assets/meta.svg",
  "/cubeiq-assets/instagram.svg",
  "/cubeiq-assets/google%20ads.svg",
  "/cubeiq-assets/googleconsole.svg",
  "/cubeiq-assets/shopify.svg",
  "/cubeiq-assets/whatsapp.svg",
];

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vLight;

  void main() {
    vUv = uv;
    vec3 p = position;

    float edge = sin(uv.x * 3.14159265);
    float vertical = sin(uv.y * 3.14159265);
    float wave = sin(uv.x * 5.5 + uv.y * 3.0 + uTime * 0.52);
    float velocityWave = sin(uv.y * 7.0 + uTime * 0.9) * abs(uVelocity);

    p.z += edge * vertical * uBend;
    p.z += wave * edge * 0.025 * abs(uVelocity);
    p.x += (uv.y - 0.5) * uVelocity * 0.12;
    p.y += velocityWave * edge * 0.018;

    vLight = clamp(0.88 + p.z * 0.38 + wave * 0.025, 0.68, 1.12);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uContrast;
  varying vec2 vUv;
  varying float vLight;

  vec2 coverUv(vec2 uv, float imageAspect, float planeAspect) {
    vec2 result = uv;
    if (planeAspect > imageAspect) {
      float visibleHeight = imageAspect / planeAspect;
      result.y = (uv.y - 0.5) * visibleHeight + 0.5;
    } else {
      float visibleWidth = planeAspect / imageAspect;
      result.x = (uv.x - 0.5) * visibleWidth + 0.5;
    }
    return result;
  }

  float roundedMask(vec2 uv, float radius) {
    vec2 q = abs(uv - 0.5) - vec2(0.5 - radius);
    float distanceToEdge = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-0.004, 0.009, distanceToEdge);
  }

  void main() {
    vec2 uv = coverUv(vUv, uImageAspect, uPlaneAspect);
    vec4 color = texture2D(uTexture, uv);
    color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
    color.rgb *= vLight;

    float mask = roundedMask(vUv, 0.055);
    float edgeGlow = 1.0 - smoothstep(0.0, 0.035, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    color.rgb += edgeGlow * 0.035;

    gl_FragColor = vec4(color.rgb, color.a * uOpacity * mask);
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min: number, max: number, value: number) {
  const t = clamp01((value - min) / Math.max(0.0001, max - min));
  return t * t * (3 - 2 * t);
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

function dampTransform(mesh: THREE.Mesh, target: Transform, delta: number, strength = 7) {
  mesh.position.x = damp(mesh.position.x, target.position[0], strength, delta);
  mesh.position.y = damp(mesh.position.y, target.position[1], strength, delta);
  mesh.position.z = damp(mesh.position.z, target.position[2], strength, delta);
  mesh.rotation.x = damp(mesh.rotation.x, target.rotation[0], strength, delta);
  mesh.rotation.y = damp(mesh.rotation.y, target.rotation[1], strength, delta);
  mesh.rotation.z = damp(mesh.rotation.z, target.rotation[2], strength, delta);
  mesh.scale.x = damp(mesh.scale.x, target.scale[0], strength, delta);
  mesh.scale.y = damp(mesh.scale.y, target.scale[1], strength, delta);
}

const MediaPlane = forwardRef<THREE.Mesh, MediaPlaneProps>(function MediaPlane(
  {
    src,
    scale = [2.6, 1.7],
    opacity = 1,
    bend = 0,
    velocity = 0,
    time = 0,
    contrast = 1.04,
  },
  ref,
) {
  const texture = useTexture(src);
  const image = texture.image as { width?: number; height?: number } | undefined;
  const imageAspect = image?.width && image?.height ? image.width / image.height : 1.5;

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, [texture]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: time },
      uBend: { value: bend },
      uVelocity: { value: velocity },
      uOpacity: { value: opacity },
      uImageAspect: { value: imageAspect },
      uPlaneAspect: { value: scale[0] / scale[1] },
      uContrast: { value: contrast },
    }),
    [bend, contrast, imageAspect, opacity, scale, texture, time, velocity],
  );

  return (
    <mesh ref={ref} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1, 48, 34]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
});

function IconSprite({
  src,
  index,
  radius,
  progress,
  mode,
}: {
  src: string;
  index: number;
  radius: number;
  progress: MutableRefObject<number>;
  mode: "hero" | "system" | "final";
}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(src);
  const { size } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;

    const mobileScale = size.width < 760 ? 0.72 : 1;
    const p = progress.current;
    const direction = mode === "final" ? 1 : -1;
    const angle = index * (Math.PI * 2 / ICON_ASSETS.length) + state.clock.elapsedTime * 0.055 * direction + p * 0.8;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9 + index) * 0.035;
    const modeRadius = mode === "system" ? radius * 1.08 : radius;

    const targetX = Math.cos(angle) * modeRadius;
    const targetY = Math.sin(angle) * modeRadius * (mode === "system" ? 0.48 : 0.68);
    const targetZ = mode === "final" ? Math.sin(angle * 1.5) * 0.65 - 0.35 : -0.65 - Math.cos(angle) * 0.35;

    mesh.position.x = damp(mesh.position.x, targetX, 4.5, delta);
    mesh.position.y = damp(mesh.position.y, targetY, 4.5, delta);
    mesh.position.z = damp(mesh.position.z, targetZ, 4.5, delta);
    mesh.rotation.z = damp(mesh.rotation.z, -angle * 0.08, 4, delta);
    const scale = 0.34 * mobileScale * pulse;
    mesh.scale.setScalar(damp(mesh.scale.x, scale, 5, delta));
  });

  return (
    <mesh ref={ref} renderOrder={20}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.02}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ConnectionWeb({
  progress,
  mode,
}: {
  progress: MutableRefObject<number>;
  mode: "hero" | "system" | "final";
}) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const points: number[] = [];
    const count = mode === "system" ? 10 : 8;
    const radius = mode === "system" ? 3.8 : 3.15;

    for (let index = 0; index < count; index += 1) {
      const angle = index * (Math.PI * 2 / count);
      const next = (index + 1) * (Math.PI * 2 / count);
      points.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.58,
        -1.25,
        Math.cos(next) * radius,
        Math.sin(next) * radius * 0.58,
        -1.25,
      );
      points.push(
        0,
        0,
        -0.25,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.58,
        -1.25,
      );
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return buffer;
  }, [mode]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!group.current || !material.current) return;
    const p = progress.current;
    const targetOpacity = mode === "hero" ? smoothstep(0.18, 0.78, p) * 0.24 : 0.18 + p * 0.18;
    material.current.opacity = damp(material.current.opacity, targetOpacity, 5, delta);
    group.current.rotation.z = state.clock.elapsedTime * (mode === "final" ? -0.025 : 0.018);
    group.current.scale.setScalar(0.92 + p * 0.08);
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={material}
          color={mode === "final" ? "#65a4ff" : "#1d67f6"}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function HeroComposition({
  progress,
  velocity,
  pointer,
  reducedMotion,
}: Omit<CubeIQSceneProps, "mode" | "active">) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { size } = useThree();

  const scattered: Transform[] = useMemo(
    () => [
      { position: [-4.2, 1.9, -2.3], rotation: [-0.14, 0.5, -0.24], scale: [2.1, 1.32] },
      { position: [4.0, 2.1, -2.8], rotation: [0.16, -0.55, 0.2], scale: [2.2, 1.42] },
      { position: [-4.5, -1.8, -1.6], rotation: [-0.12, 0.4, 0.18], scale: [2.15, 1.35] },
      { position: [4.4, -1.7, -1.8], rotation: [0.12, -0.45, -0.12], scale: [2.2, 1.42] },
      { position: [-0.3, 3.5, -3.7], rotation: [0.24, 0.08, -0.16], scale: [2.0, 1.28] },
      { position: [0.5, -3.4, -3.2], rotation: [-0.22, -0.08, 0.13], scale: [2.0, 1.28] },
    ],
    [],
  );

  const assembled: Transform[] = useMemo(
    () => [
      { position: [-2.8, 0.55, -0.45], rotation: [-0.05, 0.12, -0.12], scale: [2.75, 1.75] },
      { position: [-1.25, -0.8, 0.15], rotation: [0.04, 0.04, 0.09], scale: [2.8, 1.78] },
      { position: [0.15, 0.9, -0.1], rotation: [-0.03, -0.03, -0.035], scale: [3.25, 2.05] },
      { position: [1.65, -0.7, -0.2], rotation: [0.04, -0.08, -0.08], scale: [2.75, 1.74] },
      { position: [2.9, 0.55, -0.65], rotation: [-0.04, -0.15, 0.1], scale: [2.55, 1.62] },
      { position: [0.2, -2.1, -1.2], rotation: [0.12, 0.02, 0.02], scale: [2.3, 1.42] },
    ],
    [],
  );

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;

    const p = reducedMotion ? 0.52 : progress.current;
    const gather = smoothstep(0.02, 0.68, p);
    const release = smoothstep(0.68, 1, p);
    const mobile = size.width < 760;
    const viewportScale = mobile ? 0.62 : size.width < 1100 ? 0.82 : 1;

    root.rotation.y = damp(root.rotation.y, pointer.current.x * 0.07 * (1 - p), 5, delta);
    root.rotation.x = damp(root.rotation.x, pointer.current.y * 0.04 * (1 - p), 5, delta);
    root.position.y = damp(root.position.y, mobile ? -0.4 : -0.25 - release * 1.5, 5, delta);
    root.scale.setScalar(damp(root.scale.x, viewportScale * (1 - release * 0.08), 5, delta));

    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const from = scattered[index];
      const to = assembled[index];
      const target: Transform = {
        position: [
          THREE.MathUtils.lerp(from.position[0], to.position[0], gather),
          THREE.MathUtils.lerp(from.position[1], to.position[1], gather),
          THREE.MathUtils.lerp(from.position[2], to.position[2], gather) - release * 0.4,
        ],
        rotation: [
          THREE.MathUtils.lerp(from.rotation[0], to.rotation[0], gather),
          THREE.MathUtils.lerp(from.rotation[1], to.rotation[1], gather),
          THREE.MathUtils.lerp(from.rotation[2], to.rotation[2], gather),
        ],
        scale: [
          THREE.MathUtils.lerp(from.scale[0], to.scale[0], gather),
          THREE.MathUtils.lerp(from.scale[1], to.scale[1], gather),
        ],
      };

      dampTransform(mesh, target, delta, 6.5);
      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uVelocity.value = damp(material.uniforms.uVelocity.value, velocity.current, 6, delta);
      material.uniforms.uBend.value = damp(
        material.uniforms.uBend.value,
        0.02 + Math.sin(index * 1.7 + p * Math.PI) * 0.018 + Math.abs(velocity.current) * 0.1,
        6,
        delta,
      );
      material.uniforms.uOpacity.value = damp(
        material.uniforms.uOpacity.value,
        0.95 - release * (index === 2 ? 0.28 : 0.55),
        6,
        delta,
      );
      material.uniforms.uPlaneAspect.value = mesh.scale.x / Math.max(0.001, mesh.scale.y);
    });
  });

  return (
    <group ref={group} position={[0, -0.25, 0]}>
      <ConnectionWeb progress={progress} mode="hero" />
      {IMAGE_ASSETS.map((src, index) => (
        <MediaPlane
          key={src}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          src={src}
          opacity={0}
        />
      ))}
      {ICON_ASSETS.map((src, index) => (
        <IconSprite key={src} src={src} index={index} radius={3.9} progress={progress} mode="hero" />
      ))}
    </group>
  );
}

function SystemReel({
  progress,
  velocity,
  pointer,
  reducedMotion,
}: Omit<CubeIQSceneProps, "mode" | "active">) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { size } = useThree();

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;

    const p = reducedMotion ? 0.08 : progress.current;
    const indexProgress = p * (IMAGE_ASSETS.length - 1);
    const mobile = size.width < 760;
    const baseScale = mobile ? 0.68 : size.width < 1100 ? 0.88 : 1;

    root.rotation.y = damp(root.rotation.y, pointer.current.x * 0.035, 5, delta);
    root.rotation.x = damp(root.rotation.x, pointer.current.y * 0.02, 5, delta);
    root.scale.setScalar(damp(root.scale.x, baseScale, 5, delta));

    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const distance = index - indexProgress;
      const absolute = Math.abs(distance);
      const active = Math.max(0, 1 - absolute);
      const x = distance * (mobile ? 2.2 : 2.72);
      const y = Math.sin(distance * 0.82) * (mobile ? 0.42 : 0.62) + 0.12;
      const z = -absolute * 1.15 + active * 0.55;
      const width = THREE.MathUtils.lerp(2.35, mobile ? 3.6 : 4.15, active);
      const height = THREE.MathUtils.lerp(1.46, mobile ? 2.25 : 2.62, active);

      dampTransform(
        mesh,
        {
          position: [x, y, z],
          rotation: [
            -0.04 + Math.sin(distance) * 0.035,
            -distance * 0.16,
            distance * -0.045 + velocity.current * 0.03,
          ],
          scale: [width, height],
        },
        delta,
        7.5,
      );

      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uVelocity.value = damp(material.uniforms.uVelocity.value, velocity.current, 7, delta);
      material.uniforms.uBend.value = damp(
        material.uniforms.uBend.value,
        0.03 + active * 0.085 + Math.abs(velocity.current) * 0.12,
        7,
        delta,
      );
      material.uniforms.uOpacity.value = damp(
        material.uniforms.uOpacity.value,
        absolute > 2.7 ? 0 : 0.42 + active * 0.58,
        7,
        delta,
      );
      material.uniforms.uPlaneAspect.value = mesh.scale.x / Math.max(0.001, mesh.scale.y);
    });
  });

  return (
    <group ref={group}>
      <ConnectionWeb progress={progress} mode="system" />
      {IMAGE_ASSETS.map((src, index) => (
        <MediaPlane
          key={src}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          src={src}
          opacity={0}
          contrast={1.07}
        />
      ))}
      {ICON_ASSETS.map((src, index) => (
        <IconSprite key={src} src={src} index={index} radius={4.65} progress={progress} mode="system" />
      ))}
    </group>
  );
}

function FinalCore({
  progress,
  velocity,
  pointer,
  reducedMotion,
}: Omit<CubeIQSceneProps, "mode" | "active">) {
  const root = useRef<THREE.Group>(null);
  const imageMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Group>(null);
  const { size } = useThree();

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;

    const p = reducedMotion ? 1 : smoothstep(0.08, 0.9, progress.current);
    const mobile = size.width < 760;
    const baseScale = mobile ? 0.68 : size.width < 1100 ? 0.84 : 1;

    group.scale.setScalar(damp(group.scale.x, baseScale, 5, delta));
    group.rotation.y = damp(
      group.rotation.y,
      pointer.current.x * 0.045 + state.clock.elapsedTime * 0.025,
      4,
      delta,
    );
    group.rotation.x = damp(group.rotation.x, pointer.current.y * 0.025, 4, delta);

    if (core.current) {
      core.current.scale.setScalar(damp(core.current.scale.x, 0.42 + p * 0.58, 6, delta));
      core.current.rotation.x = state.clock.elapsedTime * 0.12;
      core.current.rotation.y = state.clock.elapsedTime * 0.18;
    }

    imageMeshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const angle = index * (Math.PI * 2 / IMAGE_ASSETS.length) - Math.PI / 2;
      const scatteredRadius = mobile ? 5.4 : 6.4;
      const resolvedRadius = mobile ? 2.75 : 3.45;
      const radius = THREE.MathUtils.lerp(scatteredRadius, resolvedRadius, p);
      const startY = Math.sin(angle * 1.7) * 2.2;
      const endY = Math.sin(angle) * 1.55;
      const width = THREE.MathUtils.lerp(2.55, 1.72, p);
      const height = THREE.MathUtils.lerp(1.6, 1.08, p);

      dampTransform(
        mesh,
        {
          position: [
            Math.cos(angle) * radius,
            THREE.MathUtils.lerp(startY, endY, p),
            Math.sin(angle) * 0.9 - 0.55,
          ],
          rotation: [0.02, -Math.cos(angle) * 0.2, angle + Math.PI / 2],
          scale: [width, height],
        },
        delta,
        6.5,
      );

      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uVelocity.value = damp(material.uniforms.uVelocity.value, velocity.current, 6, delta);
      material.uniforms.uBend.value = damp(
        material.uniforms.uBend.value,
        0.03 + (1 - p) * 0.12 + Math.abs(velocity.current) * 0.08,
        6,
        delta,
      );
      material.uniforms.uOpacity.value = damp(material.uniforms.uOpacity.value, 0.34 + p * 0.52, 6, delta);
      material.uniforms.uPlaneAspect.value = mesh.scale.x / Math.max(0.001, mesh.scale.y);
    });
  });

  return (
    <group ref={root}>
      <ConnectionWeb progress={progress} mode="final" />

      <group ref={core} scale={0.4}>
        <RoundedBox args={[1.48, 1.48, 1.48]} radius={0.16} smoothness={6}>
          <meshPhysicalMaterial
            color="#0a50d7"
            roughness={0.24}
            metalness={0.18}
            transmission={0.14}
            thickness={0.8}
            emissive="#06245b"
            emissiveIntensity={0.72}
            clearcoat={1}
            clearcoatRoughness={0.16}
          />
        </RoundedBox>
        <RoundedBox args={[1.06, 1.06, 1.06]} radius={0.12} smoothness={5} scale={0.72}>
          <meshBasicMaterial color="#78adff" wireframe transparent opacity={0.28} />
        </RoundedBox>
      </group>

      {IMAGE_ASSETS.map((src, index) => (
        <MediaPlane
          key={src}
          ref={(mesh) => {
            imageMeshes.current[index] = mesh;
          }}
          src={src}
          opacity={0}
          contrast={1.05}
        />
      ))}

      {ICON_ASSETS.map((src, index) => (
        <IconSprite key={src} src={src} index={index} radius={4.45} progress={progress} mode="final" />
      ))}
    </group>
  );
}

function SceneContent(props: CubeIQSceneProps) {
  const { mode, ...shared } = props;

  if (mode === "hero") return <HeroComposition {...shared} />;
  if (mode === "system") return <SystemReel {...shared} />;
  return <FinalCore {...shared} />;
}

export default function CubeIQScene(props: CubeIQSceneProps) {
  const darkScene = props.mode === "final";

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={props.active && !props.reducedMotion ? "always" : "demand"}
      camera={{ position: [0, 0, props.mode === "system" ? 7.6 : 8.4], fov: props.mode === "system" ? 40 : 38 }}
      gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
      fallback={
        <div
          style={{
            width: "100%",
            height: "100%",
            background: darkScene
              ? "radial-gradient(circle at center, rgba(8,102,255,.22), transparent 55%)"
              : "radial-gradient(circle at center, rgba(8,102,255,.12), transparent 58%)",
          }}
        />
      }
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = darkScene ? 1.08 : 1;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={darkScene ? 0.85 : 1.15} />
      <directionalLight position={[4, 6, 6]} intensity={darkScene ? 2.1 : 1.35} color="#dbeaff" />
      {darkScene && <pointLight position={[0, 0, 3]} intensity={30} distance={12} color="#176cff" />}
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
