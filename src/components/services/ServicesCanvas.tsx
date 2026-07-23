"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { cubeitServices } from "./services-data";
import type { ServicesTimelineState } from "./useServicesScrollTimeline";

type ServicesCanvasProps = {
  timelineRef: MutableRefObject<ServicesTimelineState>;
  selectedIndex: number;
  reducedMotion: boolean;
};

const storyPoses: Array<{
  rotation: [number, number, number];
  position: [number, number, number];
  scale: number;
}> = [
  { rotation: [-0.18, 0.45, 0], position: [0.72, -0.18, 0], scale: 0.86 },
  { rotation: [0.05, 0.95, -0.06], position: [0.92, -0.02, 0], scale: 0.96 },
  { rotation: [0.3, 1.45, -0.12], position: [1.05, 0.04, 0], scale: 0.98 },
  { rotation: [0.48, 2.05, -0.2], position: [0.9, -0.04, 0], scale: 0.94 },
  { rotation: [0.28, 2.55, -0.08], position: [0.72, 0.02, 0], scale: 0.9 },
];

const faceConfigs = [
  { normal: new THREE.Vector3(0, 0, 1), rotation: new THREE.Euler(0, 0, 0), glyph: true },
  { normal: new THREE.Vector3(0, 0, -1), rotation: new THREE.Euler(0, Math.PI, 0) },
  { normal: new THREE.Vector3(1, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
  { normal: new THREE.Vector3(-1, 0, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
  { normal: new THREE.Vector3(0, 1, 0), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) },
  { normal: new THREE.Vector3(0, -1, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
];

function mixPose(progress: number) {
  const scaled = THREE.MathUtils.clamp(progress, 0, 1) * (storyPoses.length - 1);
  const index = Math.min(storyPoses.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const from = storyPoses[index];
  const to = storyPoses[index + 1];

  return {
    rotation: [
      THREE.MathUtils.lerp(from.rotation[0], to.rotation[0], local),
      THREE.MathUtils.lerp(from.rotation[1], to.rotation[1], local),
      THREE.MathUtils.lerp(from.rotation[2], to.rotation[2], local),
    ] as [number, number, number],
    position: [
      THREE.MathUtils.lerp(from.position[0], to.position[0], local),
      THREE.MathUtils.lerp(from.position[1], to.position[1], local),
      THREE.MathUtils.lerp(from.position[2], to.position[2], local),
    ] as [number, number, number],
    scale: THREE.MathUtils.lerp(from.scale, to.scale, local),
  };
}

function BrandGlyph() {
  return (
    <group position={[0, 0, 0.058]} rotation={[0, 0, -0.08]} scale={0.72}>
      <mesh position={[-0.22, 0.12, 0]}>
        <boxGeometry args={[0.36, 0.055, 0.018]} />
        <meshStandardMaterial color="#061739" metalness={0.35} roughness={0.24} />
      </mesh>
      <mesh position={[0.06, -0.02, 0]}>
        <boxGeometry args={[0.52, 0.055, 0.018]} />
        <meshStandardMaterial color="#1e63f4" emissive="#1e63f4" emissiveIntensity={0.18} metalness={0.2} roughness={0.26} />
      </mesh>
      <mesh position={[0.26, -0.18, 0]}>
        <boxGeometry args={[0.28, 0.055, 0.018]} />
        <meshStandardMaterial color="#6b9eff" emissive="#1e63f4" emissiveIntensity={0.1} metalness={0.2} roughness={0.24} />
      </mesh>
    </group>
  );
}

function PrecisionCube({
  timelineRef,
  selectedIndex,
  reducedMotion,
}: ServicesCanvasProps) {
  const groupRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<Array<THREE.Group | null>>([]);
  const seamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const targetRotation = useRef(new THREE.Euler(storyPoses[0].rotation[0], storyPoses[0].rotation[1], storyPoses[0].rotation[2]));
  const targetPosition = useRef(new THREE.Vector3(0, -0.15, 0));
  const pulse = useRef(0);
  const pulseTarget = useRef(0);
  const previousSelected = useRef(selectedIndex);

  useEffect(() => {
    if (previousSelected.current !== selectedIndex) {
      pulseTarget.current = 1;
      previousSelected.current = selectedIndex;
    }
  }, [selectedIndex]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const timeline = timelineRef.current;
    const storyPose = mixPose(timeline.storyProgress);
    const servicePose = cubeitServices[selectedIndex]?.pose ?? cubeitServices[0].pose;
    const selectorWeight = timeline.selectorProgress;
    const horizontalWeight = timeline.horizontalProgress;
    const introWeight = timeline.introProgress;
    const velocityDamp = 1 - Math.min(0.65, Math.abs(timeline.scrollVelocity) * 0.35);
    const float = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.025;
    const pointerX = reducedMotion ? 0 : timeline.pointerX * 0.07 * velocityDamp;
    const pointerY = reducedMotion ? 0 : timeline.pointerY * 0.055 * velocityDamp;

    let rx = storyPose.rotation[0];
    let ry = storyPose.rotation[1];
    let rz = storyPose.rotation[2];
    let x = storyPose.position[0];
    let y = storyPose.position[1] + float;
    let z = storyPose.position[2];
    let scale = storyPose.scale;

    if (introWeight > 0 && timeline.storyProgress < 0.08) {
      rx = THREE.MathUtils.lerp(-0.28, rx, introWeight);
      ry = THREE.MathUtils.lerp(0.3, ry, introWeight);
      rz = THREE.MathUtils.lerp(0.02, rz, introWeight);
      y = THREE.MathUtils.lerp(-0.72, y, introWeight);
      scale = THREE.MathUtils.lerp(0.72, scale, introWeight);
    }

    if (horizontalWeight > 0) {
      const h = Math.min(1, horizontalWeight / 0.24);
      x = THREE.MathUtils.lerp(x, -1.45, h);
      y = THREE.MathUtils.lerp(y, -0.22, h);
      z = THREE.MathUtils.lerp(z, -0.36, h);
      scale = THREE.MathUtils.lerp(scale, 0.68, h);
      ry += h * 0.5;
      rz -= h * 0.1;
    }

    if (selectorWeight > 0) {
      const s = selectorWeight;
      rx = THREE.MathUtils.lerp(rx, servicePose[0], s);
      ry = THREE.MathUtils.lerp(ry, servicePose[1], s);
      rz = THREE.MathUtils.lerp(rz, servicePose[2], s);
      x = THREE.MathUtils.lerp(x, 0, s);
      y = THREE.MathUtils.lerp(-0.76, -0.18 + float, s);
      z = THREE.MathUtils.lerp(-0.28, 0, s);
      scale = THREE.MathUtils.lerp(0.74, 1.02, s);
    }

    targetRotation.current.set(rx + pointerY, ry + pointerX, rz);
    targetPosition.current.set(x, y, z);

    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetRotation.current.x, 9, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotation.current.y, 9, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, targetRotation.current.z, 9, delta);
    group.position.x = THREE.MathUtils.damp(group.position.x, targetPosition.current.x, 8, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetPosition.current.y, 8, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, targetPosition.current.z, 8, delta);
    const responsiveScale = state.viewport.width < 6 ? 0.62 : 0.76;
    const targetScale = scale * responsiveScale;
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 8, delta));

    pulse.current = THREE.MathUtils.damp(pulse.current, pulseTarget.current, 14, delta);
    pulseTarget.current = THREE.MathUtils.damp(pulseTarget.current, 0, 7, delta);
    const panelOffset = 0.88 + 0.025 + pulse.current * 0.032;
    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      const normal = faceConfigs[index].normal;
      panel.position.set(normal.x * panelOffset, normal.y * panelOffset, normal.z * panelOffset);
    });

    if (seamMaterialRef.current) {
      seamMaterialRef.current.opacity = THREE.MathUtils.damp(
        seamMaterialRef.current.opacity,
        0.09 + pulse.current * 0.12 + Math.abs(timeline.scrollVelocity) * 0.03,
        8,
        delta,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.56, 1.56, 1.56]} radius={0.18} smoothness={14}>
        <meshPhysicalMaterial
          color="#061739"
          metalness={0.46}
          roughness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          reflectivity={0.58}
        />
      </RoundedBox>
      <RoundedBox args={[1.74, 1.74, 1.74]} radius={0.22} smoothness={12}>
        <meshBasicMaterial
          ref={seamMaterialRef}
          color="#1e63f4"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </RoundedBox>
      {faceConfigs.map((face, index) => (
        <group
          key={index}
          ref={(node) => {
            panelRefs.current[index] = node;
          }}
          rotation={face.rotation}
        >
          <RoundedBox args={[1.62, 1.62, 0.085]} radius={0.12} smoothness={12}>
            <meshPhysicalMaterial
              color={index % 2 === 0 ? "#f8fbff" : "#0b1f4d"}
              metalness={index % 2 === 0 ? 0.18 : 0.44}
              roughness={0.18}
              clearcoat={0.85}
              clearcoatRoughness={0.12}
              emissive={index % 2 === 0 ? "#000000" : "#061739"}
              emissiveIntensity={0.1}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[1.28, 1.28]} />
            <meshBasicMaterial color="#1e63f4" transparent opacity={0.045} wireframe depthWrite={false} />
          </mesh>
          {face.glyph ? <BrandGlyph /> : null}
        </group>
      ))}
    </group>
  );
}

function ServicesLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 4.5, 4]} intensity={3.2} color="#ffffff" />
      <directionalLight position={[-3, -1.5, 3]} intensity={1.3} color="#6b9eff" />
      <pointLight position={[0, 0, 2.2]} intensity={1.2} color="#1e63f4" distance={4.2} />
      <spotLight position={[0, 4.5, 5]} angle={0.42} penumbra={0.75} intensity={2.2} color="#ffffff" />
    </>
  );
}

function Scene(props: ServicesCanvasProps) {
  const { camera, gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);

  useFrame((_, delta) => {
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.2, 4, delta);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <ServicesLighting />
      <PrecisionCube {...props} />
    </>
  );
}

export default function ServicesCanvas(props: ServicesCanvasProps) {
  const dpr = useMemo<[number, number]>(() => (typeof window !== "undefined" && window.innerWidth < 760 ? [1, 1.2] : [1, 1.65]), []);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 32, position: [0, 0, 6.2], near: 0.1, far: 40 }}
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
