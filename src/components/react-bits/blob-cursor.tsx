"use client";

/**
 * PremiumCursor v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Single 20 px rounded-square cursor — visible, clean, premium.
 *
 * Design decisions:
 *   • ONE element only — no separate precision dot.
 *   • Frame-rate-independent LERP via  f = 1 − e^(−speed × dt).
 *     Feel is the same at 60 Hz, 120 Hz, 144 Hz.
 *   • `scale` CSS property handles hover/press/moving states so it never
 *     fights the JS translate3d(…) that drives position.
 *   • `data-moving`  → scale 1.06  (barely perceptible "alive" feel)
 *   • `data-hover`   → scale 1.13  (10–13 % — per spec)
 *   • `data-pressed` → scale 0.83  (gentle compression, not extreme)
 *   • No rotation, no stretching, no squashing.
 */

import { useEffect, useRef } from "react";

const LERP_SPEED   = 14;   // higher = follows faster; 14 ≈ 0.21 factor @ 60 fps
const INTERACTIVE  = "a, button, label, [data-cursor], input, select, textarea";
const MOVE_TIMEOUT = 110;  // ms after last move before "moving" state clears

export default function BlobCursor({ className = "" }: { className?: string }) {
  const rootRef     = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root     = rootRef.current;
    const follower = followerRef.current;

    if (!root || !follower) return;
    if (!window.matchMedia("(pointer: fine)").matches)         return;
    if ( window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.dataset.enabled = "true";
    document.body.classList.add("has-elastic-cursor");

    let targetX   = -80, targetY   = -80;
    let followerX = targetX, followerY = targetY;
    let raf       = 0;
    let lastTime  = 0;
    let moveTimer = 0;

    // ── RAF loop — frame-rate independent ──────────────────────────────────
    const scheduleFrame = () => {
      if (!raf) {
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap large gaps
      lastTime  = now;

      // Exponential lerp — consistent feel at any refresh rate
      const f = 1 - Math.exp(-LERP_SPEED * dt);

      followerX += (targetX - followerX) * f;
      followerY += (targetY - followerY) * f;

      follower.style.transform =
        `translate3d(${followerX}px,${followerY}px,0) translate(-50%,-50%)`;

      // Keep looping until settled
      if (Math.abs(targetX - followerX) > 0.06 ||
          Math.abs(targetY - followerY) > 0.06) {
        raf = requestAnimationFrame(tick);
      }
    };

    // ── Pointer events ─────────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      targetX = e.clientX;
      targetY = e.clientY;

      const isInteractive =
        !!(e.target as HTMLElement | null)?.closest(INTERACTIVE);
      root.dataset.hover   = isInteractive ? "true" : "false";
      root.dataset.moving  = "true";

      // Clear "moving" shortly after pointer settles
      clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => {
        root.dataset.moving = "false";
      }, MOVE_TIMEOUT);

      scheduleFrame();
    };

    const onDown   = () => { root.dataset.pressed = "true";  };
    const onUp     = () => { root.dataset.pressed = "false"; };
    const onLeave  = () => { root.dataset.visible = "false"; };
    const onEnter  = () => { root.dataset.visible = "true";  scheduleFrame(); };

    window.addEventListener("pointermove",   onMove,  { passive: true });
    window.addEventListener("pointerdown",   onDown,  { passive: true });
    window.addEventListener("pointerup",     onUp,    { passive: true });
    window.addEventListener("pointercancel", onUp,    { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    scheduleFrame();

    return () => {
      document.body.classList.remove("has-elastic-cursor");
      cancelAnimationFrame(raf);
      clearTimeout(moveTimer);
      window.removeEventListener("pointermove",   onMove);
      window.removeEventListener("pointerdown",   onDown);
      window.removeEventListener("pointerup",     onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`elastic-cursor ${className}`}
      data-visible="true"
      aria-hidden="true"
    >
      {/* Single rounded-square cursor — JS drives translate, CSS drives scale */}
      <span ref={followerRef} className="elastic-cursor__follower" />
    </div>
  );
}
