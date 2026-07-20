"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useState, type CSSProperties } from "react";

const clientProjects = [
  {
    name: "Darabyte",
    label: "AI · ERP · Custom software",
    type: "Technology company website",
    image: "/client-work/darabyte.png",
    width: 1905,
    height: 851,
    brief: "A confident corporate platform positioning Darabyte around intelligent transformation, ERP, automation, and custom software.",
    outcome: "A clearer digital front door for a broad technology offering.",
    tags: ["Brand website", "Service architecture", "Lead generation"],
  },
  {
    name: "ASAB ERP",
    label: "Marine operations · AI",
    type: "Maritime SaaS website",
    image: "/client-work/asab-erp.png",
    width: 1777,
    height: 857,
    brief: "A product-led website for a maritime operations platform spanning talent acquisition, vessels, suppliers, agents, managers, and ports.",
    outcome: "Complex platform capabilities organized into a calm product story.",
    tags: ["SaaS", "ERP modules", "AI positioning"],
  },
  {
    name: "Jaunt Solutions",
    label: "Strategy · Technology · Services",
    type: "Digital transformation website",
    image: "/client-work/jaunt-solutions.png",
    width: 1776,
    height: 848,
    brief: "A cinematic, service-led experience that frames Jaunt as a transformation partner across technology, strategy, and industry delivery.",
    outcome: "A stronger visual identity with an immediate project pathway.",
    tags: ["Corporate UX", "Service discovery", "Art direction"],
  },
  {
    name: "Dynamic Innovations",
    label: "Innovation · Enterprise change",
    type: "Corporate transformation website",
    image: "/client-work/dynamic-innovations.png",
    width: 1767,
    height: 867,
    brief: "A polished corporate presence built around intentional innovation, modern services, and a more distinctive point of view.",
    outcome: "A refined brand story with a focused conversion journey.",
    tags: ["Brand system", "Responsive UI", "Conversion design"],
  },
  {
    name: "DEA — Modern",
    label: "Energy · Engineering · Automation",
    type: "Return engagement · Chapter II",
    image: "/client-work/dea-modern.png",
    width: 1777,
    height: 855,
    brief: "DEA returned to CubeIT for a more modern website—one able to communicate industrial scale, energy technology, and engineering authority with greater impact.",
    outcome: "A returning client, reintroduced for a new digital era.",
    tags: ["Website redesign", "Industrial UX", "Returning client"],
  },
  {
    name: "DEA — Original",
    label: "Engineering · Automation",
    type: "Original delivery · Chapter I",
    image: "/client-work/dea-original.png",
    width: 1875,
    height: 862,
    brief: "The earlier DEA website was designed around the company's priorities at the time, presenting its engineering expertise, background, and service scope clearly.",
    outcome: "A dependable first digital chapter that met the brief of its time.",
    tags: ["Original website", "Company profile", "Foundation"],
  },
] as const;

export default function ClientWorkShowcase() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const project = clientProjects[active];

  const select = (index: number) => {
    if (index === active) return;
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const step = (amount: 1 | -1) => {
    setDirection(amount);
    setActive((current) => (current + amount + clientProjects.length) % clientProjects.length);
  };

  return (
    <section className="client-work-section page-shell" id="client-projects" aria-labelledby="client-work-title">

      {/* ── Heading ── */}
      <motion.div
        className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14"
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.76, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="pill">Selected client deliveries</span>
        <h2 id="client-work-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-5">
          Websites that moved the{" "}
          <span className="text-[#2563EB] dark:text-blue-500 relative inline-block">
            business
            <svg
              className="absolute -bottom-2 left-0 w-full h-2 text-[#2563EB]/30"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </span>{" "}
          forward.
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-[680px]">
          Six launches across SaaS, digital transformation, maritime operations, and industrial engineering—including a client who returned for their next chapter.
        </p>
      </motion.div>

      {/* ── Theatre card ── */}
      <div className="client-work-theatre reveal-card">
        <div className="client-work-ambient" aria-hidden="true" />
        <div className="client-work-ambient client-work-ambient--secondary" aria-hidden="true" />

        {/* Left panel — project details */}
        <div className="client-work-details" aria-live="polite">
          <div className="client-work-counter">
            <span>{String(active + 1).padStart(2, "0")}</span>
            <i />
            <small>{String(clientProjects.length).padStart(2, "0")}</small>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={project.name}
              custom={direction}
              initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 30, filter: reduceMotion ? "none" : "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -22, filter: reduceMotion ? "none" : "blur(6px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="client-work-copy"
            >
              <span className="client-work-type">{project.type}</span>
              <h3>{project.name}</h3>
              <p>{project.brief}</p>
              <strong>{project.outcome}</strong>
              <div className="client-work-tags">
                {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="client-work-controls">
            <button type="button" onClick={() => step(-1)} aria-label="Previous client project"><ArrowLeft /></button>
            <button type="button" onClick={() => step(1)} aria-label="Next client project"><ArrowRight /></button>
          </div>
        </div>

        {/* Right panel — browser mockup */}
        <div className="client-work-stage">
          <div className="client-work-browser">
            <div className="client-work-browser-bar" aria-hidden="true">
              <span /><span /><span />
              <p>{project.label}</p>
              <i><ArrowUpRight /></i>
            </div>
            <div
              className="client-work-screen"
              style={{ "--client-image-ratio": `${project.width} / ${project.height}` } as CSSProperties}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.figure
                  key={project.image}
                  custom={direction}
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.965, x: reduceMotion ? 0 : direction * 54 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.018, x: reduceMotion ? 0 : direction * -42 }}
                  transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={project.image}
                    alt={`${project.name} website interface`}
                    width={project.width}
                    height={project.height}
                    sizes="(max-width: 900px) 94vw, 60vw"
                    priority={active === 0}
                  />
                </motion.figure>
              </AnimatePresence>
              <div className="client-work-screen-shine" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ── Bento thumbnail grid ── */}
        <div className="client-work-bento" aria-label="Choose a client project">
          {clientProjects.map((item, index) => (
            <motion.button
              type="button"
              key={item.name}
              onClick={() => select(index)}
              aria-pressed={active === index}
              className={active === index ? "cw-bento-card is-active" : "cw-bento-card"}
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.58,
                delay: index * 0.072,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Screenshot fill */}
              <span className="cw-bento-img">
                <Image
                  src={item.image}
                  alt=""
                  width={item.width}
                  height={item.height}
                  sizes="(max-width: 780px) 50vw, (max-width: 1152px) 34vw, 320px"
                />
              </span>
              {/* Active indicator dot */}
              <span className="cw-bento-dot" aria-hidden="true" />
              {/* Project meta overlay */}
              <span className="cw-bento-meta">
                <span className="cw-bento-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="cw-bento-name">{item.name}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
