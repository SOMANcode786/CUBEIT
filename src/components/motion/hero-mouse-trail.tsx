"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// ── Color palette ──────────────────────────────────────────────────────────────
const COLORS = [
  "rgba(139,92,246,0.72)",   // purple
  "rgba(167,139,250,0.68)",  // violet
  "rgba(236,72,153,0.68)",   // pink
  "rgba(251,113,133,0.65)",  // coral
  "rgba(253,186,116,0.65)",  // peach
  "rgba(251,146,60,0.65)",   // orange
  "rgba(34,211,238,0.68)",   // cyan
  "rgba(56,189,248,0.65)",   // sky
  "rgba(52,211,153,0.65)",   // mint
  "rgba(163,230,53,0.60)",   // lime
  "rgba(250,204,21,0.65)",   // yellow
] as const;

// ── SVG shape catalog ─────────────────────────────────────────────────────────
type ShapeKey =
  | "sparkle4" | "star5" | "diamond" | "cross"
  | "circle" | "clover" | "flower" | "plus"
  | "triangle" | "hexagon";

const SHAPE_KEYS: ShapeKey[] = [
  "sparkle4","star5","diamond","cross","circle",
  "clover","flower","plus","triangle","hexagon",
];

/** Lightweight inline SVG for each shape type. */
function ShapeIcon({ type, fill }: { type: ShapeKey; fill: string }) {
  switch (type) {
    case "sparkle4":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M12 2L13.6 9.4L21 11L13.6 12.6L12 20L10.4 12.6L3 11L10.4 9.4Z" fill={fill} />
          <path d="M20 2L20.9 5.1L24 6L20.9 6.9L20 10L19.1 6.9L16 6L19.1 5.1Z" fill={fill} opacity="0.55" />
        </svg>
      );
    case "star5":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M12 2L14.6 8.9L22 9.3L16.5 14.1L18.4 21.3L12 17.5L5.6 21.3L7.5 14.1L2 9.3L9.4 8.9Z" fill={fill} />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M12 2L22 10L12 22L2 10Z" fill={fill} />
          <path d="M12 6L18 10L12 18L6 10Z" fill="white" opacity="0.18" />
        </svg>
      );
    case "cross":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="10" y="2" width="4" height="20" rx="2" fill={fill} />
          <rect x="2" y="10" width="20" height="4" rx="2" fill={fill} />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="12" cy="12" r="9" fill={fill} />
          <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.22" />
        </svg>
      );
    case "clover":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="8"  cy="8"  r="4.2" fill={fill} />
          <circle cx="16" cy="8"  r="4.2" fill={fill} />
          <circle cx="8"  cy="16" r="4.2" fill={fill} />
          <circle cx="16" cy="16" r="4.2" fill={fill} />
          <circle cx="12" cy="12" r="3.2" fill={fill} />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" />
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" transform="rotate(120 12 12)" />
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" transform="rotate(180 12 12)" />
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" transform="rotate(240 12 12)" />
          <ellipse cx="12" cy="5.5" rx="2.8" ry="4.5" fill={fill} opacity="0.85" transform="rotate(300 12 12)" />
          <circle cx="12" cy="12" r="3.5" fill="white" opacity="0.7" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M10.5 3.5H13.5V10.5H20.5V13.5H13.5V20.5H10.5V13.5H3.5V10.5H10.5V3.5Z" fill={fill} />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M12 3L22 21H2Z" fill={fill} />
          <path d="M12 9L18 21H6Z" fill="white" opacity="0.14" />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M12 2L20.6 7V17L12 22L3.4 17V7Z" fill={fill} />
          <path d="M12 6L17.2 9V15L12 18L6.8 15V9Z" fill="white" opacity="0.14" />
        </svg>
      );
    default:
      return null;
  }
}

// ── Particle type ─────────────────────────────────────────────────────────────
interface Particle {
  id: string;
  /** Spawn X relative to container */
  x: number;
  /** Spawn Y relative to container */
  y: number;
  shape: ShapeKey;
  /** Rendered size in px */
  size: number;
  /** End rotation delta in deg */
  rotateTo: number;
  fill: string;
  /** Travel offset X in px */
  dx: number;
  /** Travel offset Y in px */
  dy: number;
  /** Animation duration in ms */
  duration: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function buildParticle(x: number, y: number, isClick: boolean): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = isClick ? rand(70, 150) : rand(24, 60);
  return {
    id: `${performance.now().toFixed(0)}-${Math.random().toString(36).slice(2, 7)}`,
    x,
    y,
    shape: pick(SHAPE_KEYS),
    size: rand(isClick ? 16 : 8, isClick ? 30 : 20),
    rotateTo: rand(-200, 200),
    fill: pick(COLORS),
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    duration: rand(620, 920),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Overlay that renders a mouse-trail + click-burst particle system over the
 * element it is placed inside. Uses `position:absolute` so it must live inside
 * a `position:relative` parent. `pointer-events:none` ensures zero interaction
 * interference with underlying UI.
 */
export function HeroMouseTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTrailTime = useRef(0);
  const maxTrail = 28; // cap live trail particles in DOM

  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const spawnTrail = useCallback((x: number, y: number) => {
    const now = performance.now();
    const throttle = rand(20, 42);
    if (now - lastTrailTime.current < throttle) return;
    lastTrailTime.current = now;

    const p = buildParticle(x, y, false);
    setParticles(prev => {
      // Evict oldest trail particles if over cap
      const trimmed = prev.length >= maxTrail ? prev.slice(prev.length - maxTrail + 1) : prev;
      return [...trimmed, p];
    });
  }, []);

  const spawnBurst = useCallback((x: number, y: number) => {
    const count = Math.round(rand(6, 11));
    const burst: Particle[] = Array.from({ length: count }, () => buildParticle(x, y, true));
    setParticles(prev => [...prev, ...burst]);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Listen on window — the overlay itself has pointer-events:none so
    // attaching listeners to it would never fire. We translate viewport
    // coords to container-local coords via getBoundingClientRect().
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      // Only spawn when cursor is inside the container bounds
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom
      ) return;
      spawnTrail(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom
      ) return;
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onTouch = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const t = e.touches[0];
      if (!t) return;
      if (
        t.clientX < rect.left || t.clientX > rect.right ||
        t.clientY < rect.top  || t.clientY > rect.bottom
      ) return;
      spawnBurst(t.clientX - rect.left, t.clientY - rect.top);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [spawnTrail, spawnBurst]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 15,
        // Prevent this layer from creating a new stacking context for children
        isolation: "isolate",
      }}
    >
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            // Start centered on cursor, scaled to 0
            initial={{ x: p.x - p.size / 2, y: p.y - p.size / 2, scale: 0, rotate: 0, opacity: 0.9 }}
            // Travel outward, pop in then fade
            animate={{
              x: p.x - p.size / 2 + p.dx,
              y: p.y - p.size / 2 + p.dy,
              scale: [0, 1.25, 0.95, 0],
              rotate: p.rotateTo,
              opacity: [0.9, 0.85, 0.6, 0],
            }}
            transition={{
              duration: p.duration / 1000,
              ease: [0.16, 1, 0.3, 1],           // --ease-premium
              scale: { times: [0, 0.12, 0.45, 1] },
              opacity: { times: [0, 0.12, 0.55, 1] },
            }}
            onAnimationComplete={() => removeParticle(p.id)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: p.size,
              height: p.size,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          >
            <ShapeIcon type={p.shape} fill={p.fill} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
