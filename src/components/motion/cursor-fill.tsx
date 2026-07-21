"use client";

import { useEffect } from "react";

const interactiveSelector = [
  "button:not(.technology-marquee-card):not(.expandable-card):not(.expandable-backdrop):not(.nav-work-trigger):not(.nav-work-item)",
  "a.nav-cta",
  "a.btn",
  "a.hero-scroll",
  "a.expandable-cta",
  "a.gemini-cta",
].join(",");

type CursorFillProps = {
  defaultColor?: string;
};

export function CursorFill({ defaultColor = "#005ffc" }: CursorFillProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--cursor-fill-default", defaultColor);
    const markTargets = (scope: ParentNode = document) => {
      scope.querySelectorAll<HTMLElement>(interactiveSelector).forEach((target) => {
        target.dataset.cursorFill = "true";
      });
    };
    markTargets();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(interactiveSelector)) node.dataset.cursorFill = "true";
        markTargets(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const getTarget = (event: Event) =>
      (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector) ?? null;

    const setOrigin = (target: HTMLElement, clientX: number, clientY: number) => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--cursor-fill-x", `${clientX - rect.left}px`);
      target.style.setProperty("--cursor-fill-y", `${clientY - rect.top}px`);
    };

    let activePointerTarget: HTMLElement | null = null;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = getTarget(event);
      if (target === activePointerTarget) return;
      if (activePointerTarget) activePointerTarget.dataset.cursorFillActive = "false";
      activePointerTarget = target;
      if (!target) return;
      setOrigin(target, event.clientX, event.clientY);
      target.dataset.cursorFillActive = "true";
    };

    const onPointerLeave = () => {
      if (activePointerTarget) activePointerTarget.dataset.cursorFillActive = "false";
      activePointerTarget = null;
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = getTarget(event);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      setOrigin(target, rect.left + rect.width / 2, rect.top + rect.height / 2);
      target.dataset.cursorFillActive = "true";
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = getTarget(event);
      if (target) target.dataset.cursorFillActive = "false";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      observer.disconnect();
      root.style.removeProperty("--cursor-fill-default");
    };
  }, [defaultColor]);

  return null;
}
