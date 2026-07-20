"use client";

/**
 * LoadingScreen — Premium first-load / refresh-only overlay
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows on:
 *   navigate   → cold first load
 *   reload     → Ctrl+R / F5 / Ctrl+Shift+R
 *
 * Skips on:
 *   back_forward → bfcache restore (instant, no flash)
 *   SPA nav      → layout.tsx stays mounted, component never re-mounts
 *
 * Features:
 *   • Thin shimming progress line (0 → 82% while loading, 100% on ready)
 *   • Logo + wordmark fade-up with blue glow halo
 *   • Three staggered pulsing cubes (no spinner)
 *   • Rotating status messages with crossfade
 *   • Exit: logo scales down, overlay fades 700ms
 *   • prefers-reduced-motion: all JS animations disabled, instant transitions
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const MESSAGES = [
  "Building Intelligent Systems",
  "Engineering Digital Products",
  "Preparing Your Experience",
  "Launching Innovation",
];

const MIN_DISPLAY_MS = 1500;
const MSG_INTERVAL_MS = 1300;

/* Shared easings */
const SPRING = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0.4, 0, 0.2, 1] as const;

export default function LoadingScreen() {
  const reduced = useReducedMotion();
  const [visible,  setVisible]  = useState(false);
  const [pageReady, setPageReady] = useState(false); // fires when window.load is done
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;

    if (nav?.type !== "navigate" && nav?.type !== "reload") return;

    setVisible(true);
    const startTime = performance.now();

    const msgTimer = setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES.length),
      MSG_INTERVAL_MS,
    );

    const dismiss = () => {
      setPageReady(true); // fills progress bar to 100 %
      const elapsed = performance.now() - startTime;
      const hold    = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => {
        clearInterval(msgTimer);
        setVisible(false);
      }, hold);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }

    return () => {
      clearInterval(msgTimer);
      window.removeEventListener("load", dismiss);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ls"
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
          transition={reduced ? { duration: 0.15 } : { duration: 0.72, ease: EASE_OUT }}
          role="status"
          aria-label="Loading CubeIT"
        >

          {/* ── Progress line ─────────────────────────────────────────────── */}
          <div className="ls-progress-track" aria-hidden="true">
            <motion.div
              className="ls-progress-fill"
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{
                scaleX:  pageReady ? 1 : 0.82,
                opacity: pageReady ? 0 : 1,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : pageReady
                    ? { scaleX: { duration: 0.28, ease: "easeOut" }, opacity: { delay: 0.28, duration: 0.24 } }
                    : { scaleX: { duration: 1.5,  ease: EASE_OUT } }
              }
              style={{ transformOrigin: "left center" }}
            />
          </div>

          {/* ── Ambient glow ──────────────────────────────────────────────── */}
          <div className="ls-glow" aria-hidden="true" />

          {/* ── Grid texture ──────────────────────────────────────────────── */}
          <div className="ls-grid" aria-hidden="true" />

          {/* ── Identity: logo + wordmark ─────────────────────────────────── */}
          <motion.div
            className="ls-identity"
            initial={reduced ? undefined : { opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -10, scale: 0.92 }}
            transition={reduced ? { duration: 0 } : { duration: 0.76, delay: 0.06, ease: SPRING }}
          >
            {/* Halo glow behind the PNG */}
            <div className="ls-logo-halo" aria-hidden="true" />

            <div className="ls-logo-tile">
              <Image
                src="/brand/cubeit-logo.png"
                alt="CubeIT"
                width={532}
                height={569}
                priority
              />
            </div>

            {/* Wordmark */}
            <motion.strong
              className="ls-wordmark"
              initial={reduced ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.52, delay: 0.26, ease: SPRING }}
            >
              CubeIT
            </motion.strong>

            {/* Tagline */}
            <motion.p
              className="ls-tagline"
              initial={reduced ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.48, delay: 0.38 }}
            >
              Intelligent Software for Modern Business
            </motion.p>
          </motion.div>

          {/* ── Three pulsing cubes ───────────────────────────────────────── */}
          <div className="ls-cubes" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="ls-cube"
                initial={reduced ? undefined : { opacity: 0, scaleY: 0.4 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.38, delay: 0.52 + i * 0.07, ease: SPRING }
                }
                style={{ animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </div>

          {/* ── Rotating status message ───────────────────────────────────── */}
          <motion.div
            className="ls-messages"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.68 }}
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                className="ls-message"
                initial={reduced ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: SPRING }}
              >
                {MESSAGES[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
