"use client";

import { useEffect, useRef } from "react";

const KINETIC_SVG_ASSETS = [
  { src: "/kinetic-svgs/01_folded_bow.svg", baseSize: 48 },
  { src: "/kinetic-svgs/02_gold_spark.svg", baseSize: 28 },
  { src: "/kinetic-svgs/03_purple_radial_burst.svg", baseSize: 42 },
  { src: "/kinetic-svgs/04_coral_asterisk.svg", baseSize: 38 },
  { src: "/kinetic-svgs/05_pink_dot_flower.svg", baseSize: 34 },
  { src: "/kinetic-svgs/06_cyan_split_ring.svg", baseSize: 36 },
  { src: "/kinetic-svgs/07_green_crescent.svg", baseSize: 38 },
  { src: "/kinetic-svgs/08_violet_pinwheel.svg", baseSize: 44 },
  { src: "/kinetic-svgs/09_blue_orbit_donut.svg", baseSize: 40 },
  { src: "/kinetic-svgs/10_blue_starburst.svg", baseSize: 36 },
  { src: "/kinetic-svgs/11_peach_fold.svg", baseSize: 46 },
  { src: "/kinetic-svgs/12_magenta_clover.svg", baseSize: 40 },
  { src: "/kinetic-svgs/13_duotone_x_bloom.svg", baseSize: 42 },
  { src: "/kinetic-svgs/14_teal_arc.svg", baseSize: 34 },
  { src: "/kinetic-svgs/15_pink_micro_spark.svg", baseSize: 26 },
  { src: "/kinetic-svgs/16_indigo_flowerburst.svg", baseSize: 44 },
  { src: "/kinetic-svgs/17_orange_diamond_spark.svg", baseSize: 32 },
  { src: "/kinetic-svgs/18_cyan_petal_cross.svg", baseSize: 40 },
];

interface Particle {
  el: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
  gravity: number;
  scale: number;
  createdAt: number;
}

export default function KineticCursorTrail({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const mouseVelRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMousePosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const svgBagRef = useRef<number[]>([]);

  const getNextSvgIndex = () => {
    if (svgBagRef.current.length === 0) {
      const indices = Array.from({ length: KINETIC_SVG_ASSETS.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      svgBagRef.current = indices;
    }
    return svgBagRef.current.pop()!;
  };

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !isFinePointer) return;

    const MAX_PARTICLES = 25;
    const MIN_SPAWN_DIST = 45;
    const MIN_SPAWN_INTERVAL = 40;

    const isPointerInHeroCanvas = (clientX: number, clientY: number) => {
      if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) {
        return false;
      }

      const currentContainer = containerRef.current;
      if (currentContainer) {
        const rect = currentContainer.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          return false;
        }
        const heroBottomLimit = Math.max(rect.bottom, window.innerHeight);
        if (clientY > heroBottomLimit) {
          return false;
        }
      } else {
        if (window.scrollY > window.innerHeight) {
          return false;
        }
      }

      return true;
    };

    const updatePhysics = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = now;

      const particles = particlesRef.current;
      const activeParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.vy += p.gravity * dt;
        p.vx *= Math.pow(0.985, dt * 60);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.angularVelocity * dt;

        const ageSec = (now - p.createdAt) / 1000;

        if (p.y < window.innerHeight + 80 && ageSec < 8) {
          p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`;
          activeParticles.push(p);
        } else {
          if (p.el.parentNode === layer) layer.removeChild(p.el);
        }
      }

      particlesRef.current = activeParticles;

      if (activeParticles.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(updatePhysics);
      } else {
        animFrameIdRef.current = null;
      }
    };

    const startLoopIfNeeded = () => {
      if (!animFrameIdRef.current) {
        lastTimeRef.current = performance.now();
        animFrameIdRef.current = requestAnimationFrame(updatePhysics);
      }
    };

    const spawnParticle = (
      clientX: number,
      clientY: number,
      opts?: { isClick?: boolean }
    ) => {
      const assetIndex = getNextSvgIndex();
      const asset = KINETIC_SVG_ASSETS[assetIndex];

      if (particlesRef.current.length >= MAX_PARTICLES) {
        const oldest = particlesRef.current.shift();
        if (oldest && oldest.el.parentNode === layer) layer.removeChild(oldest.el);
      }

      const img = document.createElement("img");
      img.src = asset.src;
      img.alt = "";
      img.ariaHidden = "true";
      img.style.position = "absolute";
      img.style.left = "0px";
      img.style.top = "0px";
      img.style.width = `${asset.baseSize}px`;
      img.style.height = `${asset.baseSize}px`;
      img.style.pointerEvents = "none";
      img.style.willChange = "transform";

      const isClick = opts?.isClick ?? false;

      const offsetX = (Math.random() - 0.5) * (isClick ? 24 : 12);
      const offsetY = (Math.random() - 0.5) * (isClick ? 24 : 12);

      const randomVx = (Math.random() - 0.5) * (isClick ? 220 : 90);
      const randomVy = (Math.random() - 0.55) * (isClick ? 200 : 80) - (isClick ? 80 : 15);
      const mouseVxInfluence = isClick ? 0 : Math.max(-120, Math.min(120, mouseVelRef.current.vx * 0.12));
      const mouseVyInfluence = isClick ? 0 : Math.max(-80, Math.min(80, mouseVelRef.current.vy * 0.08));

      const particle: Particle = {
        el: img,
        x: clientX + offsetX,
        y: clientY + offsetY,
        vx: randomVx + mouseVxInfluence,
        vy: randomVy + mouseVyInfluence,
        rotation: Math.random() * 360,
        angularVelocity: (Math.random() - 0.5) * (isClick ? 360 : 220),
        gravity: 340 + Math.random() * 120,
        scale: 0.85 + Math.random() * 0.35,
        createdAt: performance.now(),
      };

      img.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`;
      layer.appendChild(img);
      particlesRef.current.push(particle);

      startLoopIfNeeded();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerInHeroCanvas(e.clientX, e.clientY)) return;

      const now = performance.now();

      if (lastMousePosRef.current) {
        const dt = (now - lastMousePosRef.current.time) / 1000;
        if (dt > 0) {
          mouseVelRef.current = {
            vx: (e.clientX - lastMousePosRef.current.x) / dt,
            vy: (e.clientY - lastMousePosRef.current.y) / dt,
          };
        }
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now };

      // Gentle proximity reaction for nearest active floating icons
      const REACTION_RADIUS = 130;
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < REACTION_RADIUS && dist > 0) {
          const factor = 1 - dist / REACTION_RADIUS;
          const pushAngle = Math.atan2(dy, dx);
          p.vx += Math.cos(pushAngle) * factor * 110;
          p.vy += Math.sin(pushAngle) * factor * 110;
          p.angularVelocity += (Math.random() - 0.5) * 140 * factor;
        }
      }

      if (!lastSpawnPosRef.current) {
        lastSpawnPosRef.current = { x: e.clientX, y: e.clientY };
        lastSpawnTimeRef.current = now;
        spawnParticle(e.clientX, e.clientY);
        return;
      }

      const dist = Math.hypot(e.clientX - lastSpawnPosRef.current.x, e.clientY - lastSpawnPosRef.current.y);
      const timeDiff = now - lastSpawnTimeRef.current;

      if (dist >= MIN_SPAWN_DIST && timeDiff >= MIN_SPAWN_INTERVAL) {
        lastSpawnPosRef.current = { x: e.clientX, y: e.clientY };
        lastSpawnTimeRef.current = now;
        spawnParticle(e.clientX, e.clientY);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!isPointerInHeroCanvas(e.clientX, e.clientY)) return;

      const CLICK_REACTION_RADIUS = 200;
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < CLICK_REACTION_RADIUS && dist > 0) {
          const factor = 1 - dist / CLICK_REACTION_RADIUS;
          const pushAngle = Math.atan2(dy, dx);
          p.vx += Math.cos(pushAngle) * factor * 350;
          p.vy += Math.sin(pushAngle) * factor * 350 - 60;
          p.angularVelocity += (Math.random() - 0.5) * 360 * factor;
        }
      }

      spawnParticle(e.clientX, e.clientY, { isClick: true });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (layer) layer.innerHTML = "";
    };
  }, [containerRef]);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    />
  );
}
