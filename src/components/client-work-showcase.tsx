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
    brief: "The earlier DEA website was designed around the company’s priorities at the time, presenting its engineering expertise, background, and service scope clearly.",
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
    <section className="client-work-section page-shell" id="client-work" aria-labelledby="client-work-title">
      <div className="client-work-heading reveal-up">
        <div>
          <span className="pill">Selected client deliveries</span>
          <h2 id="client-work-title">Websites that moved the business forward.</h2>
        </div>
        <p>Six launches across SaaS, digital transformation, maritime operations, and industrial engineering—including a client who returned for their next chapter.</p>
      </div>

      <div className="client-work-theatre reveal-card">
        <div className="client-work-ambient" aria-hidden="true" />
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
                    sizes="(max-width: 900px) 94vw, 64vw"
                    priority={active === 0}
                  />
                </motion.figure>
              </AnimatePresence>
              <div className="client-work-screen-shine" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="client-work-rail" aria-label="Choose a client project">
          {clientProjects.map((item, index) => (
            <button
              type="button"
              key={item.name}
              onClick={() => select(index)}
              aria-pressed={active === index}
              className={active === index ? "is-active" : undefined}
            >
              <span className="client-work-thumb">
                <Image src={item.image} alt="" width={item.width} height={item.height} sizes="160px" />
              </span>
              <span className="client-work-thumb-copy"><small>{String(index + 1).padStart(2, "0")}</small><b>{item.name}</b></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
