"use client";

import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type MagneticLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
};

export function MagneticLink({ href, className, children, ariaLabel }: MagneticLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    const node = linkRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    node.style.setProperty("--magnetic-x", `${x * 0.12}px`);
    node.style.setProperty("--magnetic-y", `${y * 0.12}px`);
  };

  const handleLeave = () => {
    const node = linkRef.current;
    if (!node) return;
    node.style.setProperty("--magnetic-x", "0px");
    node.style.setProperty("--magnetic-y", "0px");
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      aria-label={ariaLabel}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </Link>
  );
}
