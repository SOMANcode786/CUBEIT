"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface ExpandableCardItem {
  title: string;
  description: string;
  eyebrow: string;
  image: string;
  features: string[];
  content: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

export function ExpandableCards({ items }: { items: ExpandableCardItem[] }) {
  const [active, setActive] = useState<ExpandableCardItem | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const instanceId = useId();

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;

    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("modal-open");
      previousFocus.current?.focus();
    };
  }, [active, close]);

  return (
    <>
      <AnimatePresence>
        {active ? (
          <motion.button
            type="button"
            aria-label="Close project details"
            className="expandable-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="expandable-dialog-layer">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${instanceId}-title`}
              className="expandable-dialog"
              layoutId={`${instanceId}-${active.title}`}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div layoutId={`${instanceId}-${active.image}`} className="expandable-dialog-media">
                <Image src={active.image} alt="" fill sizes="(max-width: 720px) 92vw, 660px" />
                <div className="expandable-dialog-scrim" />
                <motion.span layoutId={`${instanceId}-${active.eyebrow}`} className="expandable-eyebrow">
                  {active.eyebrow}
                </motion.span>
                <button ref={closeRef} type="button" className="expandable-close" onClick={close} aria-label="Close project details">
                  <X aria-hidden="true" />
                </button>
              </motion.div>

              <div className="expandable-dialog-copy">
                <motion.div layoutId={`${instanceId}-${active.title}-copy`}>
                  <h3 id={`${instanceId}-title`}>{active.title}</h3>
                  <p className="expandable-description">{active.description}</p>
                </motion.div>
                <div className="expandable-feature-list" aria-label={`${active.title} capabilities`}>
                  {active.features.map((feature) => <span key={feature}>{feature}</span>)}
                </div>
                <div className="expandable-long-copy">{active.content}</div>
                <a className="expandable-cta" href={active.ctaHref ?? "/contact"} onClick={close}>
                  {active.ctaLabel ?? "Discuss this system"} <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="expandable-grid">
        {items.map((item, index) => (
          <button
            type="button"
            className="expandable-card"
            onClick={() => setActive(item)}
            key={item.title}
          >
            <motion.div layoutId={`${instanceId}-${item.image}`} className="expandable-card-media">
              <Image src={item.image} alt="" fill sizes="(max-width: 720px) 88vw, 360px" />
              <div className="expandable-card-scrim" />
              <motion.span layoutId={`${instanceId}-${item.eyebrow}`} className="expandable-eyebrow">
                {item.eyebrow}
              </motion.span>
              <span className="expandable-number">0{index + 1}</span>
            </motion.div>
            <motion.div layoutId={`${instanceId}-${item.title}-copy`} className="expandable-card-copy">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className="expandable-open" aria-hidden="true"><ArrowUpRight /></span>
            </motion.div>
          </button>
        ))}
      </div>
    </>
  );
}
