"use client";

/**
 * KineticCursorTrail
 * ─────────────────────────────────────────────────────────────────────────────
 * Emits colorful SVG shapes from the cursor as it moves across the hero area.
 * Each shape is an independent physical body with gravity, drag, and rotation.
 *
 * Architecture:
 *   • DOM-only physics — no React state updates per frame (zero re-renders).
 *   • Particles are HTMLImageElement nodes managed entirely in refs.
 *   • rAF loop runs only while live particles exist; pauses otherwise.
 *   • SVGs embedded as data: URLs — no HTTP requests, no gradient ID collisions.
 *   • Spawns on distance traveled (~50px threshold), not on every mousemove event.
 *   • Must be placed as the first child of `hero-section` so hero text
 *     (later in DOM order) naturally stacks above it inside the stacking
 *     context created by `isolation: isolate` on `.hero-section`.
 */

import { useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const r = (min: number, max: number) => min + Math.random() * (max - min);
const sign = () => (Math.random() < 0.5 ? 1 : -1);

/** Encode an SVG string as a data URL once at module load (cached). */
const enc = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

// ── Shuffled-bag selector — ensures variety before any repeat ─────────────────
function makeBag<T>(items: readonly T[]): () => T {
  let pool: T[] = [];
  return () => {
    if (!pool.length) pool = [...items].sort(() => Math.random() - 0.5);
    return pool.pop()!;
  };
}

// ── SVG Pack ─────────────────────────────────────────────────────────────────
// All 18 SVGs are pre-encoded at module load.
// `size`  — base render size in px (scale jitter applied on top)
// `gravity` — px/s²  (heavier shapes fall faster visually)
// `maxAV`   — max |angular velocity| in deg/s

type AssetDef = { url: string; size: number; gravity: number; maxAV: number };

const ASSETS: AssetDef[] = [
  // 01 folded bow — larger, moderate gravity, slow spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FF8A5C"/><stop offset="1" stop-color="#FF4FA3"/></linearGradient><linearGradient id="g2" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#FFD56A"/><stop offset="1" stop-color="#FF7A59"/></linearGradient></defs><path fill="url(#g1)" d="M22 28c19-5 34 3 42 19L52 64 20 58c2-11 2-20 2-30Z"/><path fill="url(#g2)" d="M106 28c-19-5-34 3-42 19l12 17 32-6c-2-11-2-20-2-30Z"/><path fill="#FFB45F" d="M20 70l32-6 12 17c-8 16-23 24-42 19 0-10 0-19-2-30Z"/><path fill="#FF6B91" d="M108 70l-32-6-12 17c8 16 23 24 42 19 0-10 0-19 2-30Z"/></svg>`),
    size: 52, gravity: 290, maxAV: 85,
  },
  // 02 gold spark — small, lighter gravity, faster spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF16A"/><stop offset=".45" stop-color="#FFC928"/><stop offset="1" stop-color="#FF8A00"/></linearGradient></defs><path fill="url(#g)" d="M64 8c5 31 12 39 44 44-32 5-39 13-44 44-5-31-12-39-44-44 32-5 39-13 44-44Z"/></svg>`),
    size: 28, gravity: 310, maxAV: 155,
  },
  // 03 purple radial burst — medium, normal gravity
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#C86BFF"/><stop offset=".5" stop-color="#8A55FF"/><stop offset="1" stop-color="#4F7CFF"/></linearGradient></defs><g fill="url(#g)"><ellipse cx="64" cy="22" rx="5" ry="20"/><ellipse cx="64" cy="106" rx="5" ry="20"/><ellipse cx="22" cy="64" rx="20" ry="5"/><ellipse cx="106" cy="64" rx="20" ry="5"/><ellipse cx="34.3" cy="34.3" rx="5" ry="20" transform="rotate(-45 34.3 34.3)"/><ellipse cx="93.7" cy="93.7" rx="5" ry="20" transform="rotate(-45 93.7 93.7)"/><ellipse cx="93.7" cy="34.3" rx="5" ry="20" transform="rotate(45 93.7 34.3)"/><ellipse cx="34.3" cy="93.7" rx="5" ry="20" transform="rotate(45 34.3 93.7)"/><circle cx="64" cy="64" r="9"/></g></svg>`),
    size: 40, gravity: 325, maxAV: 110,
  },
  // 04 coral asterisk — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFB36B"/><stop offset=".55" stop-color="#FF6B7D"/><stop offset="1" stop-color="#F34CB4"/></linearGradient></defs><g fill="url(#g)"><rect x="58" y="14" width="12" height="42" rx="6"/><rect x="58" y="72" width="12" height="42" rx="6"/><rect x="14" y="58" width="42" height="12" rx="6"/><rect x="72" y="58" width="42" height="12" rx="6"/><rect x="58" y="14" width="12" height="42" rx="6" transform="rotate(45 64 64)"/><rect x="58" y="14" width="12" height="42" rx="6" transform="rotate(-45 64 64)"/><rect x="58" y="72" width="12" height="42" rx="6" transform="rotate(45 64 64)"/><rect x="58" y="72" width="12" height="42" rx="6" transform="rotate(-45 64 64)"/></g></svg>`),
    size: 36, gravity: 315, maxAV: 125,
  },
  // 05 pink dot flower — medium, slow spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><radialGradient id="g"><stop stop-color="#FF87C7"/><stop offset=".65" stop-color="#F152A4"/><stop offset="1" stop-color="#C93CFF"/></radialGradient></defs><g fill="url(#g)"><circle cx="64" cy="23" r="12"/><circle cx="101" cy="49" r="12"/><circle cx="87" cy="93" r="12"/><circle cx="41" cy="93" r="12"/><circle cx="27" cy="49" r="12"/><circle cx="64" cy="64" r="8"/></g></svg>`),
    size: 38, gravity: 285, maxAV: 72,
  },
  // 06 cyan split ring — medium, slow rotation
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".15" y1=".1" x2=".85" y2=".9"><stop stop-color="#4EF2D1"/><stop offset=".5" stop-color="#19BFC5"/><stop offset="1" stop-color="#227DFF"/></linearGradient></defs><path fill="url(#g)" d="M104 64a40 40 0 1 1-12-28L78 50a20 20 0 1 0 6 14h20Z"/></svg>`),
    size: 42, gravity: 295, maxAV: 68,
  },
  // 07 green crescent — medium, slow rotation
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#55F5C0"/><stop offset=".5" stop-color="#20C790"/><stop offset="1" stop-color="#1F8E7B"/></linearGradient></defs><path fill="url(#g)" fill-rule="evenodd" d="M93 101A47 47 0 1 1 92 27 37 37 0 1 0 93 101Z"/></svg>`),
    size: 40, gravity: 305, maxAV: 70,
  },
  // 08 violet pinwheel — medium, faster spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#D36CFF"/><stop offset="1" stop-color="#7B57FF"/></linearGradient><linearGradient id="b" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#8E72FF"/><stop offset="1" stop-color="#4C62FF"/></linearGradient></defs><path fill="url(#a)" d="M64 58 22 22c26-4 43 5 49 25L64 58Z"/><path fill="url(#b)" d="m70 64 36-42c4 26-5 43-25 49l-11-7Z"/><path fill="url(#a)" d="m64 70 42 36c-26 4-43-5-49-25l7-11Z"/><path fill="url(#b)" d="M58 64 22 106c-4-26 5-43 25-49l11 7Z"/><circle cx="64" cy="64" r="8" fill="#A86CFF"/></svg>`),
    size: 38, gravity: 335, maxAV: 145,
  },
  // 09 blue orbit donut — medium, slow rotation
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".05" y1=".1" x2=".95" y2=".9"><stop stop-color="#49F0FF"/><stop offset=".48" stop-color="#2DB9FF"/><stop offset="1" stop-color="#3864FF"/></linearGradient></defs><path fill="url(#g)" fill-rule="evenodd" d="M64 16a48 48 0 1 1 0 96 48 48 0 0 1 0-96Zm0 18a30 30 0 1 0 0 60 30 30 0 0 0 0-60Z"/><circle cx="96" cy="38" r="8" fill="#69F4FF"/></svg>`),
    size: 44, gravity: 290, maxAV: 62,
  },
  // 10 blue starburst — medium, medium spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#69E9FF"/><stop offset=".45" stop-color="#5D9BFF"/><stop offset="1" stop-color="#6E5DFF"/></linearGradient></defs><path fill="url(#g)" d="M64 9 73 49 98 17 82 55 119 39 87 64l40 9-40 9 32 25-37-16 16 37-25-32-9 40-9-40-25 32 16-37-37 16 32-25-40-9 40-9L9 39l37 16-16-38 25 32 9-40Z"/></svg>`),
    size: 42, gravity: 320, maxAV: 118,
  },
  // 11 peach fold — larger, heavier, slow spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD08A"/><stop offset="1" stop-color="#FF8D65"/></linearGradient><linearGradient id="g2" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#C891FF"/><stop offset="1" stop-color="#765CFF"/></linearGradient></defs><path fill="url(#g1)" d="M22 31 64 20l-7 39-35 8V31Z"/><path fill="url(#g2)" d="m64 20 42 11v36l-35-8-7-39Z"/><path fill="#FFAF79" d="m22 67 35-8 7 49-42-11V67Z"/><path fill="#9B72FF" d="m71 59 35 8v30l-42 11 7-49Z"/></svg>`),
    size: 50, gravity: 330, maxAV: 78,
  },
  // 12 magenta clover — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#FF84CD"/><stop offset=".52" stop-color="#F44FAE"/><stop offset="1" stop-color="#B547FF"/></linearGradient></defs><g fill="url(#g)"><circle cx="64" cy="35" r="15"/><circle cx="93" cy="64" r="15"/><circle cx="64" cy="93" r="15"/><circle cx="35" cy="64" r="15"/><circle cx="64" cy="64" r="8" fill="#FFB1DC"/></g></svg>`),
    size: 40, gravity: 308, maxAV: 97,
  },
  // 13 duotone x bloom — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C568FF"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient><linearGradient id="b" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#6FD9FF"/><stop offset="1" stop-color="#406BFF"/></linearGradient></defs><path fill="url(#p)" d="M19 28c14-8 32-4 45 10L52 64 19 48V28Z"/><path fill="url(#b)" d="M109 28c-14-8-32-4-45 10l12 26 33-16V28Z"/><path fill="url(#b)" d="M19 100c14 8 32 4 45-10L52 64 19 80v20Z"/><path fill="url(#p)" d="M109 100c-14 8-32 4-45-10l12-26 33 16v20Z"/></svg>`),
    size: 42, gravity: 312, maxAV: 108,
  },
  // 14 teal arc — medium, slow rotation
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".2" x2=".9" y2=".8"><stop stop-color="#55F5C0"/><stop offset=".52" stop-color="#21D6B4"/><stop offset="1" stop-color="#1B8EA4"/></linearGradient></defs><path fill="url(#g)" d="M22 88a52 52 0 0 1 84-56L92 47A32 32 0 0 0 40 82L22 88Z"/></svg>`),
    size: 38, gravity: 302, maxAV: 66,
  },
  // 15 pink micro spark — small, lighter, faster spin
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".2" y1=".1" x2=".8" y2=".9"><stop stop-color="#FF9FD8"/><stop offset=".48" stop-color="#FF5AAE"/><stop offset="1" stop-color="#E53EEC"/></linearGradient></defs><path fill="url(#g)" d="M64 14c3 24 8 36 24 50 16 14 20 26 24 50-16-15-27-20-48-24-21 4-32 9-48 24 4-24 8-36 24-50 16-14 21-26 24-50Z"/></svg>`),
    size: 26, gravity: 275, maxAV: 158,
  },
  // 16 indigo flowerburst — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#B07BFF"/><stop offset=".55" stop-color="#6F6CFF"/><stop offset="1" stop-color="#4D9CFF"/></linearGradient></defs><g fill="url(#g)"><path d="M64 12c9 19 9 34 0 45-9-11-9-26 0-45Z"/><path d="M64 116c-9-19-9-34 0-45 9 11 9 26 0 45Z"/><path d="M12 64c19-9 34-9 45 0-11 9-26 9-45 0Z"/><path d="M116 64c-19 9-34 9-45 0 11-9 26-9 45 0Z"/><path d="M27 27c20 7 31 18 30 32-14 1-25-10-32-30l2-2Z"/><path d="M101 101c-20-7-31-18-30-32 14-1 25 10 32 30l-2 2Z"/><path d="M101 27c-7 20-18 31-32 30-1-14 10-25 30-32l2 2Z"/><path d="M27 101c7-20 18-31 32-30 1 14-10 25-30 32l-2-2Z"/><circle cx="64" cy="64" r="7"/></g></svg>`),
    size: 42, gravity: 300, maxAV: 92,
  },
  // 17 orange diamond spark — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#FFF071"/><stop offset=".45" stop-color="#FFBE2F"/><stop offset="1" stop-color="#FF7A45"/></linearGradient></defs><path fill="url(#g)" d="M64 10c7 27 15 39 39 54-24 15-32 27-39 54-7-27-15-39-39-54 24-15 32-27 39-54Z"/></svg>`),
    size: 34, gravity: 322, maxAV: 128,
  },
  // 18 cyan petal cross — medium
  {
    url: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#68F2E5"/><stop offset=".5" stop-color="#34C7DC"/><stop offset="1" stop-color="#3773FF"/></linearGradient></defs><g fill="url(#g)"><path d="M64 13c15 14 20 28 15 42-14 5-28 0-42-15 5-14 13-22 27-27Z"/><path d="M115 64c-14 15-28 20-42 15-5-14 0-28 15-42 14 5 22 13 27 27Z"/><path d="M64 115c-15-14-20-28-15-42 14-5 28 0 42 15-5 14-13 22-27 27Z"/><path d="M13 64c14-15 28-20 42-15 5 14 0 28-15 42-14-5-22-13-27-27Z"/></g></svg>`),
    size: 40, gravity: 310, maxAV: 102,
  },
] as const;

// ── Physics constants ─────────────────────────────────────────────────────────
const SPAWN_DISTANCE  = 50;   // px — cursor must travel this far to emit one shape
const MIN_INTERVAL_MS = 60;   // ms  — hard floor on spawn rate
const MAX_PARTICLES   = 26;   // desktop cap
const MAX_LIFE_MS     = 9_000;// safety timeout
const DRAG            = 0.87; // applied as vx *= DRAG^(dt*60) each frame

// ── Particle type ─────────────────────────────────────────────────────────────
interface Particle {
  img:  HTMLImageElement;
  x:    number;
  y:    number;
  vx:   number;
  vy:   number;
  rot:  number; // degrees
  av:   number; // angular velocity deg/s
  grav: number; // gravity px/s²
  sc:   number; // scale
  born: number; // performance.now()
}

// ── Component ─────────────────────────────────────────────────────────────────
export function KineticCursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── Environment checks ──────────────────────────────────────────────────
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // no-op on touch

    if (!containerRef.current) return;
    const container: HTMLDivElement = containerRef.current;

    // ── State ───────────────────────────────────────────────────────────────
    const particles: Particle[]  = [];
    const pick = makeBag(ASSETS);

    let rafId        = 0;
    let lastTime     = 0;
    let lastSpawnX   = -9999;
    let lastSpawnY   = -9999;
    let lastSpawnMs  = 0;
    let prevMX       = 0;
    let prevMY       = 0;
    let prevMT       = 0;
    let mouseVX      = 0;
    let mouseVY      = 0;
    let bounds       = container.getBoundingClientRect();

    // ── Bounds refresh ──────────────────────────────────────────────────────
    const refreshBounds = () => { bounds = container.getBoundingClientRect(); };
    const ro = new ResizeObserver(refreshBounds);
    ro.observe(container);
    window.addEventListener("scroll", refreshBounds, { passive: true });

    // ── RAF physics loop ────────────────────────────────────────────────────
    function startLoop() {
      if (rafId) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }

    function tick(now: number) {
      rafId = 0;
      const dt = Math.min((now - lastTime) / 1000, 0.033); // cap at ~30fps
      lastTime = now;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Gravity + drag
        p.vy += p.grav * dt;
        p.vx *= Math.pow(DRAG, dt * 60);

        // Integrate position & rotation
        p.x   += p.vx * dt;
        p.y   += p.vy * dt;
        p.rot += p.av * dt;

        // GPU-accelerated transform — only property we touch each frame
        p.img.style.transform =
          `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) rotate(${p.rot}deg) scale(${p.sc})`;

        // Cull: off-screen or expired
        const age = now - p.born;
        const gone =
          age > MAX_LIFE_MS ||
          p.y > bounds.height + 140 ||
          p.x < -140 ||
          p.x > bounds.width + 140 ||
          p.y < -200;

        if (gone) {
          container.removeChild(p.img);
          particles.splice(i, 1);
        }
      }

      // Only reschedule if something is still alive
      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      }
    }

    // ── Spawn one particle ──────────────────────────────────────────────────
    function spawnParticle(cx: number, cy: number) {
      // Evict oldest if at cap
      if (particles.length >= MAX_PARTICLES) {
        const evicted = particles.shift()!;
        if (evicted.img.parentNode) container.removeChild(evicted.img);
      }

      const asset = pick();
      const sc    = r(0.82, 1.22);
      const size  = asset.size * sc;

      // Tiny random offset so shapes don't all share the exact same pixel
      const ox = r(-8, 8);
      const oy = r(-8, 8);

      // Initial velocity: base random + small cursor-velocity inheritance
      // Clamp cursor influence so fast swipes don't launch shapes off-screen
      const cvx = Math.max(-300, Math.min(300, mouseVX));
      const cvy = Math.max(-300, Math.min(300, mouseVY));

      const vx = r(-65, 65) * sign() + cvx * 0.055;
      // Slight upward bias — makes some shapes arc before falling
      const vy = r(-70, 35) + cvy * 0.035;

      const av = sign() * r(15, asset.maxAV);

      // Build <img> node — data URL avoids gradient-ID conflicts between SVGs
      const img = document.createElement("img");
      img.src = asset.url;
      img.width  = size;
      img.height = size;
      img.setAttribute("aria-hidden", "true");
      img.style.cssText = `
        position:absolute;
        top:0;left:0;
        width:${size}px;height:${size}px;
        pointer-events:none;
        will-change:transform;
        user-select:none;
        -webkit-user-drag:none;
        display:block;
      `;

      const p: Particle = {
        img,
        x:    cx + ox,
        y:    cy + oy,
        vx:   Math.max(-180, Math.min(180, vx)),
        vy:   Math.max(-110, Math.min(110, vy)),
        rot:  r(0, 360),
        av,
        grav: asset.gravity,
        sc,
        born: performance.now(),
      };

      // Set initial transform before appending (no flash at 0,0)
      img.style.transform =
        `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) rotate(${p.rot}deg) scale(${p.sc})`;

      container.appendChild(img);
      particles.push(p);
      startLoop();
    }

    // ── Pointer handler ─────────────────────────────────────────────────────
    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;

      const now = performance.now();

      // Convert to container-local coordinates
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      // Guard: only spawn while inside this container
      const inside =
        x >= 0 && x <= bounds.width &&
        y >= 0 && y <= bounds.height;

      // Update approximate cursor velocity (for momentum inheritance)
      if (prevMT > 0) {
        const mdt = Math.max((now - prevMT) / 1000, 0.001);
        mouseVX = (x - prevMX) / mdt;
        mouseVY = (y - prevMY) / mdt;
      }
      prevMX = x;
      prevMY = y;
      prevMT = now;

      if (!inside) return;

      // Distance-based spawn throttle
      const dx   = x - lastSpawnX;
      const dy   = y - lastSpawnY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt_ms = now - lastSpawnMs;

      if (dist >= SPAWN_DISTANCE && dt_ms >= MIN_INTERVAL_MS) {
        spawnParticle(x, y);
        lastSpawnX  = x;
        lastSpawnY  = y;
        lastSpawnMs = now;
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", refreshBounds);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      // Clean up any remaining DOM nodes
      particles.forEach(p => p.img.parentNode && container.removeChild(p.img));
      particles.length = 0;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position:      "absolute",
        inset:         0,
        zIndex:        -1,         // between hero-noise(-2) and non-positioned flex children
        pointerEvents: "none",
        overflow:      "hidden",   // clip particles to hero section bounds
      }}
    />
  );
}
