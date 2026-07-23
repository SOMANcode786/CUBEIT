"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { cubeitServices } from "./services-data";

export type ServicesTimelineState = {
  introProgress: number;
  storyProgress: number;
  horizontalProgress: number;
  selectorProgress: number;
  scrollVelocity: number;
  pointerX: number;
  pointerY: number;
};

type TimelineRefs = {
  introRef: RefObject<HTMLElement | null>;
  storyRef: RefObject<HTMLElement | null>;
  horizontalRef: RefObject<HTMLElement | null>;
  horizontalViewportRef: RefObject<HTMLDivElement | null>;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  selectorRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

const initialTimeline: ServicesTimelineState = {
  introProgress: 0,
  storyProgress: 0,
  horizontalProgress: 0,
  selectorProgress: 0,
  scrollVelocity: 0,
  pointerX: 0,
  pointerY: 0,
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function progressThrough(rect: DOMRect, viewportHeight: number) {
  const travel = Math.max(1, rect.height - viewportHeight);
  return clamp(-rect.top / travel);
}

function entryProgress(rect: DOMRect, viewportHeight: number) {
  return clamp((viewportHeight - rect.top) / Math.max(1, viewportHeight + rect.height * 0.35));
}

export function useServicesScrollTimeline({
  introRef,
  storyRef,
  horizontalRef,
  horizontalViewportRef,
  horizontalTrackRef,
  selectorRef,
  reducedMotion,
}: TimelineRefs) {
  const timelineRef = useRef<ServicesTimelineState>({ ...initialTimeline });
  const [horizontalHeight, setHorizontalHeight] = useState<number>(0);
  const maxTranslateRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    let previousScroll = window.scrollY;
    let previousTime = performance.now();

    const measure = () => {
      const section = horizontalRef.current;
      const viewport = horizontalViewportRef.current;
      const track = horizontalTrackRef.current;
      if (!section || !viewport || !track) return;

      if (reducedMotion || window.innerWidth < 900) {
        maxTranslateRef.current = 0;
        setHorizontalHeight(0);
        section.style.removeProperty("--services-horizontal-x");
        return;
      }

      const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
      maxTranslateRef.current = maxTranslate;
      setHorizontalHeight(Math.max(window.innerHeight * 1.2, maxTranslate + window.innerHeight));
    };

    const ro = new ResizeObserver(measure);
    [horizontalRef.current, horizontalViewportRef.current, horizontalTrackRef.current].forEach((node) => {
      if (node) ro.observe(node);
    });

    measure();
    window.addEventListener("resize", measure, { passive: true });
    document.fonts?.ready.then(measure).catch(() => undefined);

    const tick = (time: number) => {
      const viewportHeight = window.innerHeight || 1;
      const currentScroll = window.scrollY;
      const delta = Math.max(16, time - previousTime);
      const velocity = (currentScroll - previousScroll) / delta;
      const introRect = introRef.current?.getBoundingClientRect();
      const storyRect = storyRef.current?.getBoundingClientRect();
      const horizontalRect = horizontalRef.current?.getBoundingClientRect();
      const selectorRect = selectorRef.current?.getBoundingClientRect();

      timelineRef.current.introProgress = introRect ? entryProgress(introRect, viewportHeight) : 0;
      timelineRef.current.storyProgress = storyRect ? progressThrough(storyRect, viewportHeight) : 0;
      timelineRef.current.horizontalProgress = horizontalRect ? progressThrough(horizontalRect, viewportHeight) : 0;
      timelineRef.current.selectorProgress = selectorRect ? entryProgress(selectorRect, viewportHeight) : 0;
      timelineRef.current.scrollVelocity = clamp(velocity * 0.35, -1, 1);

      if (!reducedMotion && window.innerWidth >= 900 && horizontalRef.current && maxTranslateRef.current > 0) {
        const x = -maxTranslateRef.current * timelineRef.current.horizontalProgress;
        horizontalRef.current.style.setProperty("--services-horizontal-x", `${x}px`);
        horizontalRef.current.style.setProperty("--services-horizontal-progress", `${timelineRef.current.horizontalProgress}`);
        horizontalRef.current.style.setProperty("--services-horizontal-header-opacity", `${Math.max(0, 1 - timelineRef.current.horizontalProgress * 20)}`);
      }

      previousScroll = currentScroll;
      previousTime = time;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [horizontalRef, horizontalTrackRef, horizontalViewportRef, introRef, reducedMotion, selectorRef, storyRef]);

  const setPointer = (x: number, y: number) => {
    timelineRef.current.pointerX = clamp(x, -1, 1);
    timelineRef.current.pointerY = clamp(y, -1, 1);
  };

  return {
    timelineRef,
    horizontalHeight,
    setPointer,
    serviceCount: cubeitServices.length,
  };
}
