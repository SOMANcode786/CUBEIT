"use client";

import { type MutableRefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./cubeiq.module.css";

export type CubeIQMotionState = {
  hero: number;
  system: number;
  final: number;
  pointerX: number;
  pointerY: number;
};

type CubeIQSceneProps = {
  motion: MutableRefObject<CubeIQMotionState>;
};

type ToolNode = {
  stage: number;
  group: THREE.Group;
  plate: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  linePoints: Float32Array;
  scale: number;
};

const TOOL_TEXTURES = [
  { stage: 0, path: "/cubeiq-assets/meta.svg", scale: 0.82 },
  { stage: 0, path: "/cubeiq-assets/instagram.svg", scale: 0.72 },
  { stage: 1, path: "/cubeiq-assets/google%20ads.svg", scale: 0.82 },
  { stage: 2, path: "/cubeiq-assets/googleconsole.svg", scale: 0.82 },
  { stage: 3, path: "/cubeiq-assets/shopify.svg", scale: 0.8 },
  { stage: 4, path: "/cubeiq-assets/whatsapp.svg", scale: 0.78 },
] as const;

const PHOTO_TEXTURE = "/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg";

const photoVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vLight;

  void main() {
    vUv = uv;
    vec3 p = position;
    float edge = sin(uv.x * 3.14159265) * sin(uv.y * 3.14159265);
    float phase = sin(uProgress * 3.14159265);
    float ripple = sin(uv.y * 8.0 + uv.x * 3.0 + uTime * 0.42);
    float curl = (uv.x - 0.5) * (uv.x - 0.5);

    p.z += edge * phase * (0.22 + abs(uVelocity) * 1.8);
    p.z += ripple * edge * 0.025;
    p.x += (uv.y - 0.5) * uVelocity * 0.5;
    p.y += curl * phase * 0.08;

    vLight = clamp(0.9 + p.z * 0.25 + ripple * 0.02, 0.75, 1.08);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const photoFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDark;
  varying vec2 vUv;
  varying float vLight;

  float roundedBoxMask(vec2 uv, float radius) {
    vec2 q = abs(uv - 0.5) - vec2(0.5 - radius);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-0.004, 0.012, d);
  }

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float mask = roundedBoxMask(vUv, 0.055);
    vec3 cool = mix(tex.rgb, vec3(0.02, 0.08, 0.18), uDark * 0.18);
    cool *= vLight;
    float edgeGlow = smoothstep(0.02, 0.0, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    cool = mix(cool, vec3(0.12, 0.42, 1.0), edgeGlow * 0.08);
    gl_FragColor = vec4(cool, tex.a * mask * uOpacity);
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function setLineCurve(
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>,
  points: Float32Array,
  start: THREE.Vector3,
  end: THREE.Vector3,
  bend: number,
) {
  const count = points.length / 3;
  const controlAX = start.x * 0.55;
  const controlAY = start.y + bend;
  const controlAZ = start.z + 0.35;
  const controlBX = end.x * 0.55;
  const controlBY = end.y - bend * 0.35;
  const controlBZ = end.z + 0.3;
  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const inv = 1 - t;
    const x =
      inv * inv * inv * start.x +
      3 * inv * inv * t * controlAX +
      3 * inv * t * t * controlBX +
      t * t * t * end.x;
    const y =
      inv * inv * inv * start.y +
      3 * inv * inv * t * controlAY +
      3 * inv * t * t * controlBY +
      t * t * t * end.y;
    const z =
      inv * inv * inv * start.z +
      3 * inv * inv * t * controlAZ +
      3 * inv * t * t * controlBZ +
      t * t * t * end.z;
    const offset = index * 3;
    points[offset] = x;
    points[offset + 1] = y;
    points[offset + 2] = z;
  }
  const attribute = line.geometry.getAttribute("position") as THREE.BufferAttribute;
  attribute.needsUpdate = true;
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const rawMaterial = mesh.material;
    if (!rawMaterial) return;
    const materialList = Array.isArray(rawMaterial) ? rawMaterial : [rawMaterial];
    materialList.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

export default function CubeIQScene({ motion }: CubeIQSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let frame = 0;
    let destroyed = false;
    let pageVisible = !document.hidden;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !coarsePointer,
        powerPreference: coarsePointer ? "default" : "high-performance",
      });
    } catch {
      canvas.dataset.failed = "true";
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarsePointer ? 1.1 : 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, 0, coarsePointer ? 9.5 : 8);

    const world = new THREE.Group();
    scene.add(world);

    const blue = new THREE.Color("#0866ff");
    const navy = new THREE.Color("#001b44");
    const white = new THREE.Color("#ffffff");
    const graphite = new THREE.Color("#dce4ef");
    const darkGraphite = new THREE.Color("#667386");
    const orange = new THREE.Color("#ff6b00");

    const outerBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 1.55, 1.55),
      new THREE.MeshBasicMaterial({
        color: blue,
        transparent: true,
        opacity: 0.035,
        depthWrite: false,
      }),
    );
    const outerEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(outerBox.geometry),
      new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.72 }),
    );
    const innerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.78, 0.78),
      new THREE.MeshBasicMaterial({
        color: navy,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      }),
    );
    const innerEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(innerBox.geometry),
      new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.42 }),
    );

    const core = new THREE.Group();
    core.add(outerBox, outerEdges, innerBox, innerEdges);
    world.add(core);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.008, 6, 160),
      new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: 0.18 }),
    );
    orbit.rotation.x = Math.PI * 0.54;
    orbit.rotation.z = -0.18;
    world.add(orbit);

    const accentNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 18),
      new THREE.MeshBasicMaterial({ color: orange, transparent: true, opacity: 0.9 }),
    );
    accentNode.position.set(0.78, -0.78, 0.78);
    core.add(accentNode);

    const textureLoader = new THREE.TextureLoader();
    const photoTexture = textureLoader.load(PHOTO_TEXTURE);
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    photoTexture.minFilter = THREE.LinearFilter;
    photoTexture.magFilter = THREE.LinearFilter;

    const photoMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTexture: { value: photoTexture },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uVelocity: { value: 0 },
        uOpacity: { value: 0 },
        uDark: { value: 0 },
      },
      vertexShader: photoVertexShader,
      fragmentShader: photoFragmentShader,
    });
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.1, coarsePointer ? 22 : 48, coarsePointer ? 16 : 30),
      photoMaterial,
    );
    world.add(photo);

    const toolNodes: ToolNode[] = [];
    const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1);
    const sharedRingGeometry = new THREE.RingGeometry(0.55, 0.565, 64);

    TOOL_TEXTURES.forEach((tool, index) => {
      const texture = textureLoader.load(tool.path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const group = new THREE.Group();
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      });
      const plate = new THREE.Mesh(sharedPlaneGeometry, material);
      plate.scale.setScalar(tool.scale);

      const haloMaterial = new THREE.MeshBasicMaterial({
        color: blue,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(sharedRingGeometry, haloMaterial);
      halo.position.z = -0.02;
      group.add(halo, plate);
      world.add(group);

      const linePoints = new Float32Array(18 * 3);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePoints, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: blue,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      world.add(line);

      toolNodes.push({
        stage: tool.stage,
        group,
        plate,
        halo,
        line,
        linePoints,
        scale: tool.scale,
      });

      // Give the paired Meta/Instagram nodes a small phase separation.
      group.userData.phaseOffset = index === 1 ? 0.22 : 0;
    });

    const timer = new THREE.Timer();
    timer.connect(document);

    let isDark = document.documentElement.classList.contains("dark");
    let themeMix = isDark ? 1 : 0;
    let currentHero = 0;
    let currentSystem = 0;
    let currentFinal = 0;
    let previousSystem = 0;
    let scrollVelocity = 0;
    const currentPointer = new THREE.Vector2();
    const corePosition = new THREE.Vector3();
    const lineStart = new THREE.Vector3();
    const nodePosition = new THREE.Vector3();
    const activePosition = new THREE.Vector3();
    const themeInk = new THREE.Color();
    const themeSecondary = new THREE.Color();
    const themeLine = new THREE.Color();

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
      if (reduceMotion) renderStatic();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onVisibility = () => {
      pageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.fov = width < 700 ? 48 : 38;
      camera.position.z = width < 700 ? 9.5 : 8;
      camera.updateProjectionMatrix();
      if (reduceMotion) renderStatic();
    };

    function applyTheme(delta: number) {
      const target = isDark ? 1 : 0;
      themeMix = THREE.MathUtils.damp(themeMix, target, 6, delta);
      themeInk.copy(navy).lerp(graphite, themeMix);
      themeSecondary.copy(navy).lerp(darkGraphite, themeMix);
      themeLine.copy(blue).lerp(white, themeMix * 0.16);
      (innerEdges.material as THREE.LineBasicMaterial).color.copy(themeSecondary);
      (innerBox.material as THREE.MeshBasicMaterial).color.copy(themeInk);
      photoMaterial.uniforms.uDark.value = themeMix;
      toolNodes.forEach((node) => {
        node.line.material.color.copy(themeLine);
      });
    }

    function updateScene(delta: number, elapsed: number) {
      const desired = motion.current;
      currentHero = THREE.MathUtils.damp(currentHero, clamp01(desired.hero), 5.2, delta);
      currentSystem = THREE.MathUtils.damp(currentSystem, clamp01(desired.system), 5.6, delta);
      currentFinal = THREE.MathUtils.damp(currentFinal, clamp01(desired.final), 5.2, delta);
      currentPointer.x = THREE.MathUtils.damp(currentPointer.x, desired.pointerX, 5.5, delta);
      currentPointer.y = THREE.MathUtils.damp(currentPointer.y, desired.pointerY, 5.5, delta);

      const rawVelocity = currentSystem - previousSystem;
      scrollVelocity = THREE.MathUtils.damp(scrollVelocity, rawVelocity, 9, delta);
      previousSystem = currentSystem;

      applyTheme(delta);

      const heroExit = easeInOut((currentHero - 0.26) / 0.74);
      const systemArrival = easeInOut(currentSystem / 0.16);
      const finalResolve = easeInOut(currentFinal);
      const mobileFactor = window.innerWidth < 700 ? 0.74 : 1;

      photo.visible = currentHero < 0.98;
      photo.position.set(
        THREE.MathUtils.lerp(2.45, 4.7, heroExit) * mobileFactor,
        THREE.MathUtils.lerp(-0.2, -1.6, heroExit),
        THREE.MathUtils.lerp(-0.2, -1.4, heroExit),
      );
      photo.rotation.set(
        -0.08 + currentPointer.y * 0.025,
        -0.18 + currentPointer.x * 0.055 + heroExit * 0.2,
        -0.075 + heroExit * 0.09,
      );
      const photoScale = window.innerWidth < 700 ? 0.72 : 1;
      photo.scale.setScalar(photoScale * (1 - heroExit * 0.08));
      photoMaterial.uniforms.uProgress.value = currentHero;
      photoMaterial.uniforms.uVelocity.value = THREE.MathUtils.clamp(scrollVelocity * 22, -0.9, 0.9);
      photoMaterial.uniforms.uTime.value = elapsed;
      photoMaterial.uniforms.uOpacity.value = (1 - heroExit) * (window.innerWidth < 700 ? 0.52 : 0.78);

      const coreHeroX = window.innerWidth < 700 ? 0 : -2.7;
      corePosition.set(
        THREE.MathUtils.lerp(coreHeroX, 0, systemArrival),
        THREE.MathUtils.lerp(-1.45, 0.72, systemArrival),
        THREE.MathUtils.lerp(-0.3, 0, systemArrival),
      );
      core.position.lerp(corePosition, 1 - Math.pow(0.0008, delta));
      core.rotation.x = elapsed * 0.12 + currentPointer.y * 0.09;
      core.rotation.y = elapsed * 0.18 + currentPointer.x * 0.13 + currentSystem * 0.7;
      core.rotation.z = -0.08 + currentSystem * 0.16;
      core.scale.setScalar(
        THREE.MathUtils.lerp(0.78, 1.12, systemArrival) * THREE.MathUtils.lerp(1, 1.4, finalResolve),
      );

      orbit.position.copy(core.position);
      orbit.rotation.z = -0.18 + elapsed * 0.04;
      orbit.rotation.y = currentPointer.x * 0.08;
      orbit.scale.setScalar(THREE.MathUtils.lerp(0.72, 1, systemArrival) * THREE.MathUtils.lerp(1, 0.56, finalResolve));
      (orbit.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(0.06, 0.23, systemArrival) * (1 - finalResolve * 0.62);

      const activeStage = currentSystem * 4;
      lineStart.copy(core.position);

      toolNodes.forEach((node, index) => {
        const phaseOffset = Number(node.group.userData.phaseOffset ?? 0);
        const stageAngle = (node.stage / 5) * Math.PI * 2 - Math.PI / 2;
        const orbitAngle = stageAngle + currentSystem * 0.95 + phaseOffset;
        const stageDistance = Math.abs(activeStage - node.stage);
        const active = Math.exp(-stageDistance * stageDistance * 2.7) * systemArrival;
        const baseRadius = (window.innerWidth < 700 ? 2.3 : 3.1) + (index % 2) * 0.08;

        const orbitX = Math.cos(orbitAngle) * baseRadius;
        const orbitY = Math.sin(orbitAngle) * baseRadius * 0.54 + 0.72;
        const orbitZ = -0.18 + Math.sin(orbitAngle * 1.4) * 0.18;
        const heroScatterX = (index - 2.5) * 0.75;
        const heroScatterY = -2.5 - (index % 2) * 0.18;

        nodePosition.set(
          THREE.MathUtils.lerp(heroScatterX, orbitX, systemArrival),
          THREE.MathUtils.lerp(heroScatterY, orbitY, systemArrival),
          THREE.MathUtils.lerp(-1.2, orbitZ, systemArrival),
        );

        activePosition.set(0, 0.92, 1.65);
        nodePosition.lerp(activePosition, active * 0.84);
        nodePosition.lerp(core.position, finalResolve * 0.9);
        node.group.position.lerp(nodePosition, 1 - Math.pow(0.0012, delta));
        node.group.rotation.z = -orbitAngle * 0.06 + scrollVelocity * 4;
        node.group.lookAt(camera.position);

        const scale =
          (0.7 + active * 0.7) *
          THREE.MathUtils.lerp(0.5, 1, systemArrival) *
          THREE.MathUtils.lerp(1, 0.34, finalResolve);
        node.group.scale.setScalar(scale);

        const baseOpacity = systemArrival * (0.2 + active * 0.8) * (1 - finalResolve * 0.82);
        node.plate.material.opacity = baseOpacity;
        node.halo.material.opacity = baseOpacity * (0.2 + active * 0.5);
        node.halo.material.color.copy(themeLine);
        node.line.material.opacity = systemArrival * (0.045 + active * 0.42) * (1 - finalResolve * 0.84);

        setLineCurve(node.line, node.linePoints, lineStart, node.group.position, Math.sin(orbitAngle) * 0.5);
      });

      const cameraTargetX = currentPointer.x * (window.innerWidth < 700 ? 0.08 : 0.18);
      const cameraTargetY = currentPointer.y * 0.12 - currentFinal * 0.15;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTargetX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTargetY, 4.5, delta);
      camera.lookAt(0, 0.15, 0);
    }

    function renderStatic() {
      currentHero = 1;
      currentSystem = 0.48;
      currentFinal = 0;
      applyTheme(1);
      updateScene(1 / 60, 0);
      renderer.render(scene, camera);
    }

    const render = (time: number) => {
      if (destroyed) return;
      if (!pageVisible) {
        frame = requestAnimationFrame(render);
        return;
      }
      timer.update(time);
      const delta = Math.min(timer.getDelta(), 0.05);
      updateScene(delta, timer.getElapsed());
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (reduceMotion) {
      renderStatic();
    } else {
      frame = requestAnimationFrame(render);
    }

    canvas.dataset.ready = "true";

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      timer.disconnect();
      timer.dispose();
      disposeScene(scene);
      sharedPlaneGeometry.dispose();
      sharedRingGeometry.dispose();
      renderer.dispose();
    };
  }, [motion]);

  return (
    <div className={styles.canvasLayer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
