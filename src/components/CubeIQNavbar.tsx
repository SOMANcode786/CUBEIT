"use client";

import { useEffect } from "react";
import { Navbar } from "./cubeit-site";

const ROOT_SECTION_ROUTES: Record<string, string> = {
  "#home": "/#home",
  "#services": "/#services",
  "#work": "/#work",
};

export function CubeIQNavbar() {
  useEffect(() => {
    const rewriteSectionLinks = () => {
      const nav = document.querySelector<HTMLElement>(".nav-shell");
      if (!nav) return;

      nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
        const replacement = ROOT_SECTION_ROUTES[link.getAttribute("href") ?? ""];
        if (replacement) link.setAttribute("href", replacement);
      });
    };

    rewriteSectionLinks();
    const observer = new MutationObserver(rewriteSectionLinks);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <Navbar />;
}
