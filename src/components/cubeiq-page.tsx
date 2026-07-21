"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  ArrowRight,
  Megaphone,
  Share2,
  Search,
  Layout,
  MessageSquare,
  Target,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// ─── Brand colours ─────────────────────────────────────────────────────────────
// Blue is used sparingly: eyebrow text, primary CTA fill, one card accent border.
const BLUE = "#1E63F4";

// ─── Card definitions ──────────────────────────────────────────────────────────
type CardDef = {
  readonly Icon: LucideIcon;
  readonly label: string;
  /** Icon colour — only BLUE for cards 0 and 3 (Ads, Website) */
  readonly iconColor: string;
  /** Absolute position inside the right-column container */
  readonly top: string;
  readonly left: string;
  readonly zIndex: number;
  /** Padding controls visual weight / perceived depth */
  readonly pad: string;
  readonly labelSize: number;
  /** GSAP from-offset for scatter-to-convergence animation */
  readonly scatter: { x: number; y: number; r: number };
  /** Only Website gets the thin blue left-border accent */
  readonly featured?: true;
};

const CARDS: CardDef[] = [
  //                                                     top     left   z   pad              size  scatter
  { Icon: Megaphone,     label: "Ads",     iconColor: BLUE,      top: "10%", left: "2%",  zIndex: 4, pad: "12px 16px", labelSize: 13,   scatter: { x: -60, y: -40, r: -10 } },
  { Icon: Share2,        label: "Social",  iconColor: "var(--muted)", top: "21%", left: "25%", zIndex: 5, pad: "14px 18px", labelSize: 13.5, scatter: { x:  44, y: -30, r:   8 } },
  { Icon: Search,        label: "Search",  iconColor: "var(--muted)", top: " 5%", left: "45%", zIndex: 3, pad: "10px 14px", labelSize: 12.5, scatter: { x:  64, y: -52, r:  12 } },
  { Icon: Layout,        label: "Website", iconColor: BLUE,      top: "42%", left: "6%",  zIndex: 6, pad: "16px 22px", labelSize: 14,   scatter: { x: -80, y:  36, r: -15 }, featured: true },
  { Icon: MessageSquare, label: "Chat",    iconColor: "var(--muted)", top: "52%", left: "37%", zIndex: 2, pad: "10px 14px", labelSize: 12.5, scatter: { x:  72, y:  50, r:  10 } },
  { Icon: Target,        label: "Convert", iconColor: "var(--muted)", top: "66%", left: "22%", zIndex: 1, pad: "12px 16px", labelSize: 13,   scatter: { x: -32, y:  62, r:  -8 } },
];

// 3-card subset shown inline below the headline on mobile
const MOBILE_CARDS: CardDef[] = [CARDS[0], CARDS[1], CARDS[3]];

// ─── Section 2 data ────────────────────────────────────────────────────────────
type ProblemCardDef = {
  readonly label: string;
  readonly top: string;
  readonly left: string;
  /** Initial CSS rotation in degrees */
  readonly rotate: number;
  /** Additional drift applied on scroll-in (desktop GSAP) */
  readonly drift: { x: number; y: number; r: number };
};

const PROBLEM_CARDS: ProblemCardDef[] = [
  { label: "Ads running alone",            top: " 6%", left: " 2%", rotate: -5, drift: { x: -28, y: -22, r: -4 } },
  { label: "Social media, no strategy",    top: "28%", left: "36%", rotate:  7, drift: { x:  32, y: -18, r:  5 } },
  { label: "Website that doesn't convert", top: "12%", left: "58%", rotate: -3, drift: { x:  22, y: -26, r: -3 } },
  { label: "Leads with no follow-up",      top: "54%", left: " 8%", rotate:  6, drift: { x: -22, y:  28, r:  4 } },
  { label: "No clear data",               top: "62%", left: "50%", rotate: -7, drift: { x:  28, y:  32, r: -5 } },
];

// ─── Section 3 data ────────────────────────────────────────────────────────────
const GROWTH_STAGES = [
  { num: "01", label: "Attract",   desc: "Put your business in front of the right people." },
  { num: "02", label: "Engage",    desc: "Give them a reason to stop, notice and care." },
  { num: "03", label: "Convert",   desc: "Turn interest into messages, enquiries and sales." },
  { num: "04", label: "Reconnect", desc: "Bring interested people back instead of losing them." },
  { num: "05", label: "Retain",    desc: "Stay connected so customers return." },
  { num: "06", label: "Scale",     desc: "Use what works to grow smarter and faster." },
] as const;

// ─── Nav ────────────────────────────────────────────────────────────────────────
// Reuses .nav-shell / .nav-links / .nav-actions from globals.css
function CubeIQNav() {
  const navRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 50) nav.removeAttribute("data-hidden");
      else if (y > lastY.current) nav.dataset.hidden = "true";
      else nav.removeAttribute("data-hidden");
      nav.toggleAttribute("data-scrolled", y > 60);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={navRef} className="nav-shell">
      <a className="nav-logo" href="/" aria-label="CubeIT home">
        <div className="logo-mark">
          <Image
            src="/brand/cubeit-logo.png"
            alt="CubeIT"
            width={80}
            height={22}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </a>

      <nav className="nav-links" aria-label="CubeIQ navigation">
        <a href="/">Home</a>
        <a href="/#services">Services</a>
        <a href="/cubeiq" style={{ color: BLUE }} aria-current="page">CubeIQ</a>
        <a href="/#work">Work</a>
      </nav>

      <div className="nav-actions">
        <AnimatedThemeToggler variant="circle" duration={480} className="theme-toggle-star" />
        <a className="nav-cta" href="/contact">
          Start a project <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const heroRef    = useRef<HTMLElement>(null);
  const clusterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    if (isMobile) {
      // Simpler fade + rise for 3-card mobile row
      const cards = mobileRefs.current.filter((c): c is HTMLDivElement => c !== null);
      tl.from(cards, { y: 28, opacity: 0, ease: "none", stagger: 0.08 });
    } else {
      // Desktop: scatter positions → cluster convergence on scroll
      const cards = clusterRefs.current.filter((c): c is HTMLDivElement => c !== null);
      cards.forEach((card, i) => {
        const { x, y, r } = CARDS[i].scatter;
        tl.from(card, { x, y, rotation: r, opacity: 0.5, ease: "none" }, i * 0.05);
      });
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      ref={heroRef}
      aria-label="CubeIQ — digital growth"
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
    >
      {/*
        Two-column grid:
        LEFT  58%  — headline, subtext, CTAs — left-aligned, not centered
        RIGHT 42%  — floating card cluster — no max-width constraint, bleeds right
        page-shell class mirrors nav-shell exactly (same width + padding-inline)
        so the left column's left edge aligns with the nav logo.
      */}
      <div
        className="page-shell cubeiq-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "58fr 42fr",
          minHeight: "100vh",
          paddingTop: "clamp(148px, 21vh, 210px)",
          paddingBottom: 88,
        }}
      >
        {/* ── Left column ───────────────────────────────────────────── */}
        <div
          className="cubeiq-hero-left"
          style={{
            paddingRight: "clamp(20px, 3vw, 48px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {/* Eyebrow — only accent-blue usage in this column */}
          <span
            style={{
              display: "block",
              fontSize: 10.5,
              fontWeight: 750,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: BLUE,
              marginBottom: 22,
            }}
          >
            CubeIQ · Digital Growth
          </span>

          {/* Headline — near-black/ink, tight leading, deliberate break */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.75rem, 6vw, 5.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: "var(--ink)",
              margin: "0 0 30px",
            }}
          >
            Marketing that moves
            <br />
            your business forward.
          </h1>

          {/* Mobile-only 3-card inline row */}
          <div
            className="cubeiq-mobile-cards"
            style={{ display: "none", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
          >
            {MOBILE_CARDS.map((card, i) => {
              const MIcon = card.Icon;
              return (
                <div
                  key={card.label}
                  ref={(el) => { mobileRefs.current[i] = el; }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "var(--surface-strong)",
                    border: "1px solid var(--line)",
                    boxShadow: "0 4px 12px rgba(8,29,73,0.07), 0 1px 3px rgba(8,29,73,0.04)",
                  }}
                >
                  <span style={{ color: card.iconColor, display: "flex" }}>
                    <MIcon size={14} aria-hidden="true" />
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Subtext — muted, constrained to ~38 characters wide */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--muted)",
              margin: "0 0 40px",
              maxWidth: "38ch",
            }}
          >
            CubeIQ brings your advertising, content, website and customer
            journey together — so more people discover your business, trust it,
            and become customers.
          </p>

          {/* CTAs — primary filled, secondary text-only (no border) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            <a className="btn btn-primary" href="/contact">
              Grow With CubeIQ
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>

            {/* Text-only secondary — no border, no background, no box */}
            <a
              href="#cubeiq-services"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 650,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                textDecoration: "none",
                opacity: 0.6,
              }}
            >
              Explore What We Do
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          {/* Scroll indicator — sits at bottom of left column, aligned with text */}
          <div
            aria-hidden="true"
            style={{
              marginTop: "auto",
              paddingTop: 48,
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: 0.25,
            }}
          >
            <div
              style={{
                width: 1,
                height: 24,
                background: "var(--ink)",
                borderRadius: 1,
                animation: "cubeiq-pulse 2.4s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              Scroll
            </span>
          </div>
        </div>

        {/* ── Right column: absolute-positioned card cluster ─────────── */}
        {/*
          Cards are at different top/left positions, z-indexes and visual sizes
          to create apparent depth and overlap without a flat grid lineup.
          The outer div has overflow: visible so cards can bleed rightward.
        */}
        <div
          className="cubeiq-hero-right"
          style={{ position: "relative", minHeight: 580, overflow: "visible" }}
        >
          {CARDS.map((card, i) => {
            const CIcon = card.Icon;
            return (
              <div
                key={card.label}
                ref={(el) => { clusterRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  top: card.top,
                  left: card.left,
                  zIndex: card.zIndex,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: card.pad,
                  borderRadius: 14,
                  // Surface adapts to light/dark mode
                  background: "var(--surface-strong)",
                  border: "1px solid var(--line)",
                  // Only the featured card gets the single blue accent
                  ...(card.featured && {
                    borderLeft: `2.5px solid ${BLUE}`,
                  }),
                  // Navy-tinted shadow (not pure black) — feels like depth, not flatness
                  boxShadow:
                    "0 8px 28px rgba(8,29,73,0.10), 0 2px 8px rgba(8,29,73,0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  willChange: "transform",
                  transformOrigin: "center",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: card.iconColor,
                  }}
                >
                  <CIcon
                    size={card.featured ? 18 : 15}
                    aria-hidden="true"
                  />
                </span>
                <span
                  style={{
                    fontSize: card.labelSize,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: "-0.025em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: The Problem ─────────────────────────────────────────────────────
function ProblemSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const mobileRefs   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const cards = mobileRefs.current.filter((c): c is HTMLDivElement => c !== null);
      gsap.set(cards, { opacity: 0, y: 20 });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      cards.forEach((c) => observer.observe(c));
      return () => observer.disconnect();
    }

    // Desktop: initial rotation via gsap.set, then scroll-linked drift
    const cards = cardRefs.current.filter((c): c is HTMLDivElement => c !== null);
    cards.forEach((card, i) => {
      gsap.set(card, { rotation: PROBLEM_CARDS[i].rotate });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    cards.forEach((card, i) => {
      const { drift, rotate } = PROBLEM_CARDS[i];
      // 0%→80%: drift outward to peak scatter
      tl.to(card, { x: drift.x, y: drift.y, rotation: rotate + drift.r, ease: "none", duration: 0.8 }, 0);
      // 80%→100%: partial recovery hinting at future order
      tl.to(card, { x: drift.x * 0.7, y: drift.y * 0.7, rotation: rotate + drift.r * 0.5, ease: "none", duration: 0.2 }, 0.8);
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cubeiq-problem"
      aria-label="The problem CubeIQ solves"
      style={{ padding: "clamp(80px, 10vw, 130px) 0", overflow: "hidden" }}
    >
      <div
        className="page-shell"
        style={{
          display: "grid",
          gridTemplateColumns: "45fr 55fr",
          gap: "clamp(32px, 4vw, 64px)",
          alignItems: "flex-start",
        }}
      >
        {/* ── Left: text ───────────────────────────────────────────── */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: 10.5,
              fontWeight: 750,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: BLUE,
              marginBottom: 22,
            }}
          >
            The Problem
          </span>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--ink)",
              margin: "0 0 28px",
            }}
          >
            Running ads is easy.
            <br />
            Building growth is harder.
          </h2>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--muted)",
              maxWidth: "45ch",
              margin: 0,
            }}
          >
            Most businesses end up with pieces that don&apos;t talk to each
            other — ads running on their own, social media managed separately,
            a website that doesn&apos;t convert, and customers who enquire but
            never get a follow-up. Nobody can see what&apos;s actually working.
          </p>

          {/* Mobile-only card stack */}
          <div
            className="cubeiq-problem-mobile"
            style={{ display: "none", flexDirection: "column", gap: 10, marginTop: 36 }}
          >
            {PROBLEM_CARDS.slice(0, 3).map((card, i) => (
              <div
                key={card.label}
                ref={(el) => { mobileRefs.current[i] = el; }}
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "var(--surface-strong)",
                  border: "1px solid var(--line)",
                  opacity: 0.82,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: scattered fragment cards ──────────────────────── */}
        <div
          className="cubeiq-problem-cluster"
          style={{ position: "relative", minHeight: 460, overflow: "visible" }}
        >
          {PROBLEM_CARDS.map((card, i) => (
            <div
              key={card.label}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: card.top,
                left: card.left,
                display: "inline-flex",
                alignItems: "center",
                padding: "11px 17px",
                borderRadius: 12,
                background: "var(--surface-strong)",
                border: "1px solid var(--line)",
                opacity: 0.82,
                boxShadow: "0 4px 14px rgba(8,29,73,0.06), 0 1px 3px rgba(8,29,73,0.04)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                willChange: "transform",
                transformOrigin: "center",
                // Initial rotation set via gsap.set in useEffect (avoids SSR flash)
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--muted)",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Growth System ────────────────────────────────────────────────────
function GrowthSystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const railRef    = useRef<HTMLDivElement>(null);
  const dotRef     = useRef<HTMLDivElement>(null);

  // Desktop pinned sequence
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    if (reducedMotion || isMobile) return;

    const stages = stageRefs.current.filter((s): s is HTMLDivElement => s !== null);

    // All stages start hidden except stage 0
    stages.forEach((stage, i) => {
      gsap.set(stage, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 60 });
    });

    const TOTAL_SCROLL = (GROWTH_STAGES.length - 1) * window.innerHeight;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${TOTAL_SCROLL}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const rail = railRef.current;
          const dot  = dotRef.current;
          if (rail && dot) {
            gsap.set(dot, { top: self.progress * Math.max(0, rail.offsetHeight - 10) });
          }
        },
      },
    });

    for (let i = 0; i < GROWTH_STAGES.length - 1; i++) {
      tl.to(stages[i],     { opacity: 0, y: -50, ease: "none", duration: 0.3 })
        .to(stages[i + 1]!, { opacity: 1, y:   0, ease: "none", duration: 0.3 }, "<0.1")
        .to({},             { duration: 0.7 }); // hold — user scrolls through this
    }

    return () => { tl.kill(); };
  }, []);

  // Mobile: simple IntersectionObserver fade-up (no pinning)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const stages = stageRefs.current.filter((s): s is HTMLDivElement => s !== null);
    stages.forEach((s) => s.classList.add("cubeiq-stage--hidden"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("cubeiq-stage--hidden");
            entry.target.classList.add("cubeiq-stage--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    stages.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cubeiq-growth-system"
      aria-label="CubeIQ growth system"
      style={{ overflow: "hidden" }}
    >
      {/*
        This div is 100vh tall — GSAP pins it for TOTAL_SCROLL scroll distance.
        On mobile + reduced-motion the height override removes the fixed 100vh.
      */}
      <div className="cubeiq-growth-inner" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <div
          className="page-shell"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Section header */}
          <div
            className="cubeiq-growth-header"
            style={{
              paddingTop: "clamp(100px, 14vh, 140px)",
              paddingBottom: "clamp(32px, 5vh, 52px)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 10.5,
                fontWeight: 750,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: BLUE,
                marginBottom: 22,
              }}
            >
              Our Growth System
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              One system.
              <br />
              Six connected stages.
            </h2>
          </div>

          {/* Rail + stages */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 40,
              paddingBottom: "clamp(60px, 8vh, 100px)",
              overflow: "hidden",
            }}
          >
            {/* Progress rail — blue only here */}
            <div className="cubeiq-rail-col" style={{ position: "relative" }}>
              <div
                ref={railRef}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 1,
                  background: "var(--line)",
                }}
              />
              <div
                ref={dotRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: BLUE,
                  zIndex: 1,
                }}
              />
            </div>

            {/* Stage container — all stages absolutely stacked */}
            <div className="cubeiq-stage-container" style={{ position: "relative" }}>
              {GROWTH_STAGES.map((stage, i) => (
                <div
                  key={stage.label}
                  ref={(el) => { stageRefs.current[i] = el; }}
                  className="cubeiq-stage"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    // SSR-safe initial state: stage 0 visible, rest hidden
                    opacity: i === 0 ? 1 : 0,
                  }}
                >
                  {/* Oversized faint numeral — editorial depth detail */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: -16,
                      top: "50%",
                      transform: "translateY(-56%)",
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(7rem, 16vw, 13rem)",
                      fontWeight: 200,
                      letterSpacing: "-0.06em",
                      lineHeight: 1,
                      color: "var(--ink)",
                      opacity: 0.04,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {stage.num}
                  </div>

                  {/* Stage label + description */}
                  <div style={{ position: "relative", paddingLeft: 4 }}>
                    <p
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        margin: "0 0 16px",
                      }}
                    >
                      {stage.num}
                    </p>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(3rem, 6.5vw, 5.5rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.0,
                        color: "var(--ink)",
                        margin: "0 0 24px",
                      }}
                    >
                      {stage.label}
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        lineHeight: 1.65,
                        color: "var(--muted)",
                        maxWidth: "38ch",
                        margin: 0,
                      }}
                    >
                      {stage.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Content placeholder (Phase 2+) ────────────────────────────────────────────
function ContentPlaceholder() {
  return (
    <section
      id="cubeiq-services"
      aria-label="CubeIQ services — coming soon"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      <div
        className="page-shell"
        style={{ padding: "80px 0 120px", textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: 0,
          }}
        >
          Full page · Phase 2 coming soon
        </p>
      </div>
    </section>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────────
export default function CubeIQPage() {
  // Lenis smooth scroll wired to GSAP ticker (same pattern as main site)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const lenisRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <style>{`
        /* Scroll-indicator pulse */
        @keyframes cubeiq-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* Mobile: single-column, hide cluster, show inline cards */
        @media (max-width: 767px) {
          .cubeiq-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .cubeiq-hero-left {
            padding-right: 0 !important;
          }
          .cubeiq-hero-right { display: none !important; }
          .cubeiq-mobile-cards { display: flex !important; }
        }

        /* Dark mode: soften the card shadow (navy shadow reads lighter on dark bg) */
        .dark .cubeiq-hero-right > div {
          box-shadow: 0 8px 28px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.18) !important;
        }

        /* ── Section 2: Problem ── */
        @media (max-width: 767px) {
          .cubeiq-problem-cluster { display: none !important; }
          .cubeiq-problem-mobile  { display: flex !important; }
          /* problem section: single column */
          #cubeiq-problem .page-shell {
            grid-template-columns: 1fr !important;
          }
        }
        .dark .cubeiq-problem-cluster > div {
          box-shadow: 0 4px 16px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.14) !important;
        }

        /* ── Section 3: Growth System ── */

        /* Mobile animation classes */
        .cubeiq-stage--hidden {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .cubeiq-stage--visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        /* Mobile overrides: unstack stages, remove pinned sizing */
        @media (max-width: 767px) {
          .cubeiq-growth-inner   { height: auto !important; }
          .cubeiq-growth-header  { padding-top: 64px !important; }
          .cubeiq-rail-col       { display: none !important; }
          .cubeiq-stage-container { overflow: visible !important; }
          /* Undo absolute stacking so stages flow normally */
          .cubeiq-stage {
            position: relative !important;
            inset: auto !important;
            padding-bottom: clamp(48px, 8vw, 64px);
          }
        }

        /* Reduced-motion overrides: show all stages as a plain list */
        @media (prefers-reduced-motion: reduce) {
          .cubeiq-growth-inner   { height: auto !important; }
          .cubeiq-rail-col       { display: none !important; }
          .cubeiq-stage-container { overflow: visible !important; }
          .cubeiq-stage {
            position: relative !important;
            inset: auto !important;
            opacity: 1 !important;
            transform: none !important;
            padding-bottom: clamp(48px, 8vw, 64px);
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--ink)",
          fontFamily: "var(--font-body)",
        }}
      >
        <CubeIQNav />
        <main>
          <HeroSection />
          <ProblemSection />
          <GrowthSystemSection />
          <ContentPlaceholder />
        </main>
      </div>
    </>
  );
}
