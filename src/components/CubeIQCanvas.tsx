"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./cubeiq.module.css";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotion;
  uniform float uAssembly;
  varying vec2 vUv;
  varying float vLight;

  void main() {
    vUv = uv;
    vec3 p = position;
    float edge = sin(uv.x * 3.14159265) * sin(uv.y * 3.14159265);
    float wave = sin(uv.x * 6.4 + uv.y * 3.8 + uTime * 0.65);
    float sweep = sin((uv.y + uAssembly * 0.45) * 5.2);
    p.z += edge * (wave * 0.035 + sweep * 0.018) * (0.25 + uMotion * 1.6);
    p.x += edge * uMotion * 0.035 * (uv.y - 0.5);
    p.y += edge * uMotion * 0.025 * (uv.x - 0.5);
    vLight = 0.92 + p.z * 0.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uTheme;
  varying vec2 vUv;
  varying float vLight;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    float mask = 1.0 - smoothstep(-0.01, 0.018, roundedBox(vUv - 0.5, vec2(0.48), 0.07));
    float vignette = smoothstep(0.92, 0.18, distance(vUv, vec2(0.5)));
    color.rgb *= vLight;
    color.rgb = mix(color.rgb, color.rgb * vec3(0.74, 0.82, 0.96), uTheme * 0.16);
    color.rgb += vignette * 0.018;
    gl_FragColor = vec4(color.rgb, color.a * uOpacity * mask);
  }
`;

type SceneNode = {
  mesh: THREE.Mesh;
  index: number;
};

type FlowDot = {
  mesh: THREE.Mesh;
  curveIndex: number;
  offset: number;
  speed: number;
};

const iconSources = [
  "/cubeiq-assets/meta.svg",
  "/cubeiq-assets/instagram.svg",
  "/cubeiq-assets/google%20ads.svg",
  "/cubeiq-assets/googleconsole.svg",
  "/cubeiq-assets/whatsapp.svg",
  "/cubeiq-assets/shopify.svg",
  "/cubeiq-assets/facebook.svg",
];

const photoSources = [
  "/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg",
  "/cubeiq-assets/1981-digital-bf9sZBcGQl4-unsplash.jpg",
];

const statePositions: THREE.Vector3[][] = [
  [
    new THREE.Vector3(-3.4, 1.9, -0.6), new THREE.Vector3(-1.6, 2.6, -1.2),
    new THREE.Vector3(2.8, 2.0, -0.8), new THREE.Vector3(3.6, -0.8, -1.4),
    new THREE.Vector3(1.0, -2.5, -0.5), new THREE.Vector3(-2.8, -1.7, -1.1),
    new THREE.Vector3(0.2, 0.8, 0.2), new THREE.Vector3(2.0, -0.2, -0.1),
  ],
  [
    new THREE.Vector3(-3.5, 1.7, -0.5), new THREE.Vector3(-2.1, 0.4, -0.8),
    new THREE.Vector3(-3.0, -1.4, -0.4), new THREE.Vector3(3.2, 1.6, -0.8),
    new THREE.Vector3(2.2, 0.0, -0.5), new THREE.Vector3(3.3, -1.7, -1.0),
    new THREE.Vector3(-0.7, 2.5, -1.5), new THREE.Vector3(0.9, -2.6, -1.2),
  ],
  [
    new THREE.Vector3(-2.7, 0.0, -0.2), new THREE.Vector3(-1.8, 1.9, -0.5),
    new THREE.Vector3(0.0, 2.65, -0.8), new THREE.Vector3(1.9, 1.8, -0.5),
    new THREE.Vector3(2.7, 0.0, -0.2), new THREE.Vector3(1.8, -1.9, -0.5),
    new THREE.Vector3(0.0, -2.65, -0.8), new THREE.Vector3(-1.9, -1.8, -0.5),
  ],
  [
    new THREE.Vector3(-1.65, 1.65, 0.2), new THREE.Vector3(0.0, 1.65, -0.15),
    new THREE.Vector3(1.65, 1.65, 0.2), new THREE.Vector3(1.65, 0.0, -0.15),
    new THREE.Vector3(1.65, -1.65, 0.2), new THREE.Vector3(0.0, -1.65, -0.15),
    new THREE.Vector3(-1.65, -1.65, 0.2), new THREE.Vector3(-1.65, 0.0, -0.15),
  ],
  [
    new THREE.Vector3(-1.25, 1.25, 0.25), new THREE.Vector3(0.0, 1.25, 0.0),
    new THREE.Vector3(1.25, 1.25, 0.25), new THREE.Vector3(1.25, 0.0, 0.0),
    new THREE.Vector3(1.25, -1.25, 0.25), new THREE.Vector3(0.0, -1.25, 0.0),
    new THREE.Vector3(-1.25, -1.25, 0.25), new THREE.Vector3(-1.25, 0.0, 0.0),
  ],
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

function darkThemeActive() {
  const root = document.documentElement;
  return root.classList.contains("dark") || root.dataset.theme === "dark";
}

function createFallbackTexture() {
  const data = new Uint8Array([230, 236, 247, 255]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

export default function CubeIQCanvas({ rootId = "cubeiq-page" }: { rootId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.getElementById(rootId);
    if (!canvas || !root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallDevice = window.matchMedia("(max-width: 760px)").matches;
    if (reducedMotion) {
      setMode("fallback");
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !smallDevice,
        powerPreference: smallDevice ? "default" : "high-performance",
      });
    } catch {
      setMode("fallback");
      return;
    }

    let destroyed = false;
    let visible = true;
    let raf = 0;
    let previousTime = performance.now();
    let smoothState = 0;
    let scrollVelocity = 0;
    let previousScroll = window.scrollY;
    let themeMix = darkThemeActive() ? 1 : 0;
    let activeTool = -1;
    const pointer = new THREE.Vector2(0, 0);
    const smoothPointer = new THREE.Vector2(0, 0);
    const textures: THREE.Texture[] = [];

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, smallDevice ? 1.18 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9.3);

    const world = new THREE.Group();
    scene.add(world);

    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    const keyLight = new THREE.PointLight(0x2f7cff, 18, 20, 2);
    keyLight.position.set(4, 4, 6);
    const warmLight = new THREE.PointLight(0xff8a3d, 5, 14, 2);
    warmLight.position.set(-4, -3, 4);
    scene.add(ambient, keyLight, warmLight);

    const cubeGeometry = new THREE.BoxGeometry(2.2, 2.2, 2.2, 2, 2, 2);
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a58df,
      transparent: true,
      opacity: 0.07,
      roughness: 0.3,
      metalness: 0.08,
      transmission: 0.18,
      depthWrite: false,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x0866ff, transparent: true, opacity: 0.62 });
    const cubeEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    const cubeGroup = new THREE.Group();
    cubeGroup.add(cube, cubeEdges);
    world.add(cubeGroup);

    const innerGeometry = new THREE.OctahedronGeometry(0.62, 1);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0866ff,
      emissive: 0x073fa8,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.18,
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    cubeGroup.add(inner);

    const nodeGeometry = new THREE.SphereGeometry(0.095, smallDevice ? 12 : 18, smallDevice ? 8 : 12);
    const nodes: SceneNode[] = [];
    for (let index = 0; index < 8; index += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: index === 3 ? 0xff8a3d : 0x0866ff,
        emissive: index === 3 ? 0x8b3510 : 0x06398f,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.copy(statePositions[0][index]);
      world.add(mesh);
      nodes.push({ mesh, index });
    }

    const connectionArray = new Float32Array(8 * 2 * 3);
    const connectionGeometry = new THREE.BufferGeometry();
    connectionGeometry.setAttribute("position", new THREE.BufferAttribute(connectionArray, 3));
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x5f8fff,
      transparent: true,
      opacity: 0.28,
    });
    const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    world.add(connections);

    const curvePairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]];
    const flowGeometry = new THREE.SphereGeometry(0.035, 10, 8);
    const flowMaterial = new THREE.MeshBasicMaterial({ color: 0x6ca0ff, transparent: true, opacity: 0.9 });
    const flowDots: FlowDot[] = [];
    const flowCount = smallDevice ? 12 : 24;
    for (let index = 0; index < flowCount; index += 1) {
      const mesh = new THREE.Mesh(flowGeometry, flowMaterial.clone());
      world.add(mesh);
      flowDots.push({
        mesh,
        curveIndex: index % curvePairs.length,
        offset: index / flowCount,
        speed: 0.08 + (index % 5) * 0.012,
      });
    }

    const iconGroup = new THREE.Group();
    world.add(iconGroup);
    const loader = new THREE.TextureLoader();
    const iconSprites: THREE.Sprite[] = [];
    iconSources.forEach((source, index) => {
      const material = new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(smallDevice ? 0.48 : 0.58);
      sprite.position.copy(statePositions[0][index]);
      iconGroup.add(sprite);
      iconSprites.push(sprite);
      loader.load(
        source,
        (texture) => {
          if (destroyed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          textures.push(texture);
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        () => undefined,
      );
    });

    const photoGroup = new THREE.Group();
    world.add(photoGroup);
    const photoMeshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
    photoSources.forEach((source, index) => {
      const fallbackTexture = createFallbackTexture();
      textures.push(fallbackTexture);
      const geometry = new THREE.PlaneGeometry(2.15, 1.38, smallDevice ? 14 : 28, smallDevice ? 10 : 18);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: fallbackTexture },
          uTime: { value: 0 },
          uMotion: { value: 0 },
          uAssembly: { value: 0 },
          uOpacity: { value: 0 },
          uTheme: { value: themeMix },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(index === 0 ? 2.5 : -2.5, index === 0 ? 1.45 : -1.55, -1.8);
      mesh.rotation.set(index === 0 ? -0.08 : 0.08, index === 0 ? -0.16 : 0.16, index === 0 ? -0.05 : 0.05);
      photoGroup.add(mesh);
      photoMeshes.push(mesh);
      loader.load(
        source,
        (texture) => {
          if (destroyed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          textures.push(texture);
          material.uniforms.uTexture.value = texture;
        },
        undefined,
        () => undefined,
      );
    });

    const particleCount = smallDevice ? 80 : 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.4 + Math.random() * 2.4;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 5.4;
      particlePositions[index * 3 + 2] = -1.8 - Math.random() * 3.2;
      particleSeeds[index] = Math.random();
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x78a6ff,
      size: smallDevice ? 0.018 : 0.022,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    world.add(particles);

    const states = Array.from(root.querySelectorAll<HTMLElement>("[data-canvas-state]"));

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const onToolEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number }>).detail;
      activeTool = typeof detail?.index === "number" ? detail.index : -1;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(root);

    const themeObserver = new MutationObserver(() => undefined);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    const updateState = () => {
      if (!states.length) return 0;
      const viewportCenter = window.innerHeight * 0.5;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      states.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = Number(section.dataset.canvasState ?? index);
        }
      });
      return clamp(nearest, 0, statePositions.length - 1);
    };

    const render = (now: number) => {
      if (destroyed) return;
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;

      const delta = Math.min(0.05, Math.max(0.001, (now - previousTime) / 1000));
      previousTime = now;
      const targetState = updateState();
      smoothState = damp(smoothState, targetState, 3.2, delta);

      const currentScroll = window.scrollY;
      const rawVelocity = (currentScroll - previousScroll) / Math.max(1, delta * 1000);
      previousScroll = currentScroll;
      scrollVelocity = damp(scrollVelocity, clamp(rawVelocity, -2.2, 2.2), 5.5, delta);

      smoothPointer.lerp(pointer, 1 - Math.exp(-4.6 * delta));
      themeMix = damp(themeMix, darkThemeActive() ? 1 : 0, 5, delta);

      const low = Math.floor(smoothState);
      const high = Math.min(statePositions.length - 1, low + 1);
      const local = THREE.MathUtils.smoothstep(smoothState - low, 0, 1);
      const stateIntensity = smoothState / (statePositions.length - 1);

      nodes.forEach(({ mesh, index }) => {
        const target = statePositions[low][index].clone().lerp(statePositions[high][index], local);
        mesh.position.lerp(target, 1 - Math.exp(-6.2 * delta));
        const selected = activeTool === index;
        const scale = selected ? 1.7 : 1 + Math.sin(now * 0.0015 + index) * 0.05;
        mesh.scale.lerp(new THREE.Vector3(scale, scale, scale), 1 - Math.exp(-8 * delta));
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = damp(material.emissiveIntensity, selected ? 2.1 : 0.85, 7, delta);
      });

      const positionAttribute = connectionGeometry.getAttribute("position") as THREE.BufferAttribute;
      curvePairs.forEach(([from, to], index) => {
        const a = nodes[from].mesh.position;
        const b = nodes[to].mesh.position;
        positionAttribute.setXYZ(index * 2, a.x, a.y, a.z);
        positionAttribute.setXYZ(index * 2 + 1, b.x, b.y, b.z);
      });
      positionAttribute.needsUpdate = true;
      connectionMaterial.opacity = 0.1 + stateIntensity * 0.42;
      connectionMaterial.color.lerpColors(new THREE.Color(0x7da8ff), new THREE.Color(0x0866ff), 1 - themeMix * 0.25);

      flowDots.forEach((dot) => {
        const [from, to] = curvePairs[dot.curveIndex];
        const a = nodes[from].mesh.position;
        const b = nodes[to].mesh.position;
        const middle = a.clone().lerp(b, 0.5);
        middle.z += 0.34 + Math.sin(dot.curveIndex) * 0.12;
        const curve = new THREE.QuadraticBezierCurve3(a, middle, b);
        const t = (now * 0.001 * dot.speed + dot.offset) % 1;
        dot.mesh.position.copy(curve.getPoint(t));
        (dot.mesh.material as THREE.MeshBasicMaterial).opacity = stateIntensity > 0.18 ? 0.82 : 0.18;
      });

      iconSprites.forEach((sprite, index) => {
        const node = nodes[index];
        if (!node) return;
        sprite.position.lerp(node.mesh.position.clone().add(new THREE.Vector3(0, 0.32, 0.05)), 1 - Math.exp(-6 * delta));
        const selected = activeTool === index;
        const base = smallDevice ? 0.42 : 0.54;
        const targetScale = base * (selected ? 1.34 : 1);
        sprite.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-8 * delta));
        const material = sprite.material as THREE.SpriteMaterial;
        material.opacity = damp(material.opacity, smoothState < 3.7 ? 0.92 : 0.35, 5, delta);
      });

      const heroVisibility = 1 - THREE.MathUtils.smoothstep(smoothState, 0.4, 1.8);
      const engineVisibility = THREE.MathUtils.smoothstep(smoothState, 1.4, 2.1) * (1 - THREE.MathUtils.smoothstep(smoothState, 2.8, 3.8));
      photoMeshes.forEach((mesh, index) => {
        const material = mesh.material;
        material.uniforms.uTime.value = now / 1000;
        material.uniforms.uMotion.value = Math.min(1, Math.abs(scrollVelocity) * 2.4);
        material.uniforms.uAssembly.value = stateIntensity;
        material.uniforms.uTheme.value = themeMix;
        material.uniforms.uOpacity.value = damp(
          material.uniforms.uOpacity.value,
          clamp(heroVisibility * 0.74 + engineVisibility * 0.56),
          5,
          delta,
        );
        const heroPosition = index === 0 ? new THREE.Vector3(2.5, 1.45, -1.7) : new THREE.Vector3(-2.55, -1.6, -1.9);
        const enginePosition = index === 0 ? new THREE.Vector3(2.9, -1.15, -1.6) : new THREE.Vector3(-2.9, 1.25, -1.7);
        mesh.position.lerp(heroPosition.clone().lerp(enginePosition, engineVisibility), 1 - Math.exp(-4 * delta));
        mesh.rotation.z = (index === 0 ? -0.055 : 0.055) + scrollVelocity * 0.02;
      });

      cubeGroup.rotation.x += delta * (0.08 + stateIntensity * 0.12);
      cubeGroup.rotation.y += delta * (0.12 + stateIntensity * 0.18);
      const targetCubeScale = smoothState < 0.8 ? 0.62 : smoothState < 2.8 ? 0.92 : 1.18;
      cubeGroup.scale.lerp(new THREE.Vector3(targetCubeScale, targetCubeScale, targetCubeScale), 1 - Math.exp(-4 * delta));
      cubeMaterial.opacity = 0.035 + stateIntensity * 0.09;
      edgeMaterial.opacity = 0.32 + stateIntensity * 0.48;
      inner.rotation.x -= delta * 0.25;
      inner.rotation.y += delta * 0.4;
      innerMaterial.emissiveIntensity = 0.45 + stateIntensity * 0.72;

      world.rotation.y = smoothPointer.x * 0.08;
      world.rotation.x = smoothPointer.y * 0.045;
      world.position.x = smoothPointer.x * 0.12;
      world.position.y = smoothPointer.y * 0.08;

      particles.rotation.z += delta * 0.012;
      particles.rotation.y -= delta * 0.018;
      particleMaterial.opacity = 0.14 + (1 - themeMix * 0.25) * 0.24;
      keyLight.position.x = 3.8 + smoothPointer.x * 1.6;
      keyLight.position.y = 3.2 + smoothPointer.y * 1.2;
      keyLight.intensity = 14 + stateIntensity * 8;
      warmLight.intensity = 2.2 + Math.abs(scrollVelocity) * 4.5;

      renderer.render(scene, camera);
    };

    resize();
    setMode("ready");
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("cubeiq:tool", onToolEvent as EventListener);
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("cubeiq:tool", onToolEvent as EventListener);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments || object instanceof THREE.Sprite) {
          const geometry = "geometry" in object ? object.geometry : undefined;
          geometry?.dispose?.();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material?.dispose?.();
        }
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [rootId]);

  return (
    <div className={styles.canvasWrap} aria-hidden="true" data-canvas-mode={mode}>
      <div className={styles.canvasFallback}>
        <span /><span /><span /><span />
        <i />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
