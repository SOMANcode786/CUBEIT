"use client";

import { useEffect, useRef } from "react";

type BlobCursorProps = { className?: string };

export default function BlobCursor({ className = "" }: BlobCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const blob = blobRef.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!root || !dot || !blob || !fine || reduce) return;

    root.dataset.enabled = "true";
    document.body.classList.add("has-elastic-cursor");
    let targetX = -80;
    let targetY = -80;
    let blobX = targetX;
    let blobY = targetY;
    let previousX = targetX;
    let previousY = targetY;
    let frame = 0;

    const requestTick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      const interactive = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-cursor]"
      );
      root.dataset.hover = interactive ? "true" : "false";
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      requestTick();
    };

    const leave = () => {
      root.dataset.visible = "false";
    };

    const enter = () => {
      root.dataset.visible = "true";
      requestTick();
    };

    const tick = () => {
      frame = 0;
      blobX += (targetX - blobX) * 0.16;
      blobY += (targetY - blobY) * 0.16;
      const dx = blobX - previousX;
      const dy = blobY - previousY;
      const speed = Math.min(18, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const stretch = 1 + speed * 0.018;
      const squash = 1 / Math.sqrt(stretch);
      blob.style.transform = `translate3d(${blobX}px, ${blobY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squash})`;
      previousX = blobX;
      previousY = blobY;
      if (Math.abs(targetX - blobX) > 0.04 || Math.abs(targetY - blobY) > 0.04 || speed > 0.02) {
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    requestTick();

    return () => {
      document.body.classList.remove("has-elastic-cursor");
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <div ref={rootRef} className={`elastic-cursor ${className}`} data-visible="true" aria-hidden="true">
      <span ref={blobRef} className="elastic-cursor__blob" />
      <span ref={dotRef} className="elastic-cursor__dot" />
    </div>
  );
}
