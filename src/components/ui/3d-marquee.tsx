"use client";

import Image from "next/image";
import { createPortal, flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type ThreeDMarqueeItem = {
  image: string;
  title: string;
  description: string;
  badge?: string;
  what: string;
  industryUse: string;
  cubeitUse: string;
};

const MORPH_DURATION = 1.35;
const MORPH_EASE = [0.22, 1, 0.36, 1] as const;

type DialogEnvironment = {
  overflow: string;
  paddingRight: string;
};

export const ThreeDMarquee = ({
  items,
  className,
}: {
  items: ThreeDMarqueeItem[];
  className?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<ThreeDMarqueeItem | null>(null);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const closingTitleRef = useRef<string | null>(null);
  const dialogEnvironmentRef = useRef<DialogEnvironment | null>(null);
  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "tween" as const, duration: MORPH_DURATION, ease: MORPH_EASE };

  const restoreDialogEnvironment = useCallback(() => {
    const environment = dialogEnvironmentRef.current;
    if (!environment) return;
    document.body.style.overflow = environment.overflow;
    document.body.style.paddingRight = environment.paddingRight;
    dialogEnvironmentRef.current = null;
  }, []);

  const openSelected = useCallback((item: ThreeDMarqueeItem) => {
    closingTitleRef.current = null;
    // Commit the pause before Motion measures the shared-layout origin.
    flushSync(() => setIsMarqueePaused(true));
    setSelected(item);
  }, []);

  const closeSelected = useCallback(() => {
    if (selected) closingTitleRef.current = selected.title;
    setSelected(null);
  }, [selected]);

  const handleExitComplete = useCallback(() => {
    restoreDialogEnvironment();
    const closingTitle = closingTitleRef.current;
    closingTitleRef.current = null;

    // Resume only after the portal and its layout projection have fully left.
    requestAnimationFrame(() => {
      setIsMarqueePaused(false);
      requestAnimationFrame(() => {
        if (closingTitle) cardRefs.current.get(closingTitle)?.focus({ preventScroll: true });
      });
    });
  }, [restoreDialogEnvironment]);

  useEffect(() => () => restoreDialogEnvironment(), [restoreDialogEnvironment]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin: "180px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selected) return;
    if (!dialogEnvironmentRef.current) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      dialogEnvironmentRef.current = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSelected();
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest<HTMLElement>("[role='dialog']");
      const focusable = dialog?.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected, closeSelected]);
  if (items.length === 0) return null;
  const chunks = Array.from({ length: 4 }, () => [] as ThreeDMarqueeItem[]);
  items.forEach((item, index) => chunks[index % chunks.length].push(item));
  return (
    <LayoutGroup id="technology-marquee-morph">
    <div
      ref={rootRef}
      className={cn(
        "mx-auto block h-[600px] overflow-hidden rounded-2xl max-sm:h-100",
        className,
      )}
    >
      <div className="flex size-full items-center justify-center">
        <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
          <div
            style={{
              transform: "translate(-50%, -50%) rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
            }}
            className="absolute top-1/2 left-1/2 grid size-full origin-center grid-cols-4 gap-8 transform-3d"
          >
            {chunks.map((subarray, colIndex) => (
              <div
                key={colIndex + "marquee"}
                className={cn(
                  "technology-marquee-column flex flex-col items-start gap-8",
                  colIndex % 2 === 0
                    ? "technology-marquee-column--down"
                    : "technology-marquee-column--up",
                  (isMarqueePaused || !isInViewport || shouldReduceMotion) && "technology-marquee-column--paused",
                )}
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((item, itemIndex) => (
                  <div className="relative" key={`${item.title}-${itemIndex}`}>
                    <GridLineHorizontal className="-top-4" offset="20px" />
                    {selected?.title === item.title ? (
                      <div className="technology-marquee-card technology-marquee-placeholder" aria-hidden="true" />
                    ) : (
                      <motion.button
                        ref={(node) => {
                          if (node) cardRefs.current.set(item.title, node);
                          else cardRefs.current.delete(item.title);
                        }}
                        layoutId={`technology-card-${item.title}`}
                        type="button"
                        onClick={() => openSelected(item)}
                        aria-haspopup="dialog"
                        aria-label={`Learn more about ${item.title}`}
                        whileHover={shouldReduceMotion ? undefined : { y: -8 }}
                        transition={layoutTransition}
                        className="technology-marquee-card"
                      >
                        <motion.div layoutId={`technology-logo-${item.title}`} className="technology-marquee-logo">
                          <Image src={item.image} alt={`${item.title} logo`} width={96} height={96} />
                        </motion.div>
                        <div className="technology-marquee-copy">
                          <motion.span layoutId={`technology-badge-${item.title}`}>{item.badge ?? "Production standard"}</motion.span>
                          <motion.h3 layoutId={`technology-title-${item.title}`}>{item.title}</motion.h3>
                          <motion.p layoutId={`technology-description-${item.title}`}>{item.description}</motion.p>
                          <span className="technology-marquee-action">Explore tool <i aria-hidden="true">↗</i></span>
                        </div>
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence onExitComplete={handleExitComplete}>
          {selected && (
            <motion.div
              className="technology-detail-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: [1, 1, 0],
                    transition: {
                      duration: MORPH_DURATION + 0.08,
                      ease: MORPH_EASE,
                      times: [0, 0.72, 1],
                    },
                  }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.46, ease: MORPH_EASE }}
              onMouseDown={(event) => { if (event.target === event.currentTarget) closeSelected(); }}
            >
              <motion.section
                layoutId={`technology-card-${selected.title}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="technology-detail-title"
                className="technology-detail-dialog"
                transition={layoutTransition}
              >
                <div className="technology-detail-topline">
                  <motion.span layoutId={`technology-badge-${selected.title}`}>{selected.badge ?? "Production standard"}</motion.span>
                  <motion.button ref={closeRef} className="technology-detail-close" type="button" onClick={closeSelected} aria-label="Close tool details" initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.38, duration: 0.3 }}>×</motion.button>
                </div>
                <div className="technology-detail-hero">
                  <motion.div layoutId={`technology-logo-${selected.title}`} className="technology-detail-logo">
                    <Image src={selected.image} alt="" width={120} height={120} />
                  </motion.div>
                  <div>
                    <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.34, duration: 0.32 }}>CubeIT technology profile</motion.small>
                    <motion.h2 layoutId={`technology-title-${selected.title}`} id="technology-detail-title">{selected.title}</motion.h2>
                    <motion.p layoutId={`technology-description-${selected.title}`}>{selected.description}</motion.p>
                  </div>
                </div>
                <motion.div className="technology-detail-grid" initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }} transition={{ delay: shouldReduceMotion ? 0 : 0.4, duration: 0.46, ease: [0.4, 0, 0.2, 1] }}>
                  <article><span>01</span><h3>What it is</h3><p>{selected.what}</p></article>
                  <article><span>02</span><h3>Why it is used</h3><p>{selected.industryUse}</p></article>
                  <article><span>03</span><h3>Why CubeIT uses it</h3><p>{selected.cubeitUse}</p></article>
                </motion.div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
    </LayoutGroup>
  );
};

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset || "150px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};
