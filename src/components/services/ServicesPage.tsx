"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Layers3, MoveRight, Sparkles } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { CursorFill } from "@/components/motion/cursor-fill";
import { Footer, Navbar } from "@/components/cubeit-site";
import { cubeitServices, deliveryMatrix, servicePrinciples, type CubeITService } from "./services-data";
import { useServicesScrollTimeline } from "./useServicesScrollTimeline";
import styles from "./services.module.css";

const ServicesCanvas = dynamic(() => import("./ServicesCanvas"), {
  ssr: false,
});

type HorizontalPanel =
  | { type: "visual"; service: CubeITService; image: string }
  | { type: "major"; service: CubeITService }
  | { type: "narrow"; service: CubeITService };

function ServiceMedia({ service, image, priority = false }: { service: CubeITService; image: string; priority?: boolean }) {
  return (
    <figure className={styles.mediaPanel}>
      <Image
        src={image}
        alt={`${service.title} capability visual`}
        fill
        sizes="(max-width: 900px) 100vw, 42vw"
        priority={priority}
      />
    </figure>
  );
}

function HorizontalPanelView({ panel, index }: { panel: HorizontalPanel; index: number }) {
  const service = panel.service;

  if (panel.type === "visual") {
    return (
      <article className={`${styles.railPanel} ${styles.visualRailPanel}`} data-accent={service.accent}>
        <ServiceMedia service={service} image={panel.image} priority={index < 2} />
        <div className={styles.railCaption}>
          <span>{service.index}</span>
          <h3>{service.title}</h3>
        </div>
      </article>
    );
  }

  if (panel.type === "narrow") {
    return (
      <article className={`${styles.railPanel} ${styles.narrowRailPanel}`} data-accent={service.accent}>
        <span className={styles.panelNumber}>{service.index}</span>
        <p>{service.proof}</p>
        <MoveRight aria-hidden="true" />
      </article>
    );
  }

  return (
    <article className={`${styles.railPanel} ${styles.majorRailPanel}`} data-accent={service.accent}>
      <span className={styles.kicker}>{service.label}</span>
      <h3>{service.thesis}</h3>
      <ul>
        {service.capabilities.slice(0, 4).map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ServicesPage() {
  const reducedMotion = Boolean(useReducedMotion());
  const [desktop3D, setDesktop3D] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const introRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLElement>(null);
  const horizontalViewportRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLElement>(null);
  const immersiveRef = useRef<HTMLElement>(null);

  const { timelineRef, horizontalHeight, setPointer } = useServicesScrollTimeline({
    introRef,
    storyRef,
    horizontalRef,
    horizontalViewportRef,
    horizontalTrackRef,
    selectorRef,
    reducedMotion: reducedMotion || !desktop3D,
  });

  useEffect(() => {
    const update = () => setDesktop3D(window.innerWidth >= 900);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const horizontalPanels = useMemo<HorizontalPanel[]>(() => (
    cubeitServices.flatMap((service) => [
      { type: "visual", service, image: service.images[0] },
      { type: "major", service },
      { type: "narrow", service },
      { type: "visual", service, image: service.images[1] },
    ] as HorizontalPanel[])
  ), []);

  const selectedService = cubeitServices[selectedIndex] ?? cubeitServices[0];

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || !desktop3D) return;
    const rect = immersiveRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer(
      ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      -((event.clientY - rect.top) / rect.height - 0.5) * 2,
    );
  };

  return (
    <div className={styles.page}>
      <CursorFill defaultColor="#1e63f4" />
      <Navbar />

      <main>
        <section className={styles.hero} id="home" aria-labelledby="services-title">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles aria-hidden="true" /> CubeIT Services</span>
            <h1 id="services-title">Services built like intelligent systems.</h1>
            <p>
              CubeIT combines AI, software engineering, automation and product design so modern businesses can move from scattered work to one scalable operating layer.
            </p>
            <div className="section-actions">
              <a className="btn btn-primary" href="/contact">Start a project <ArrowUpRight aria-hidden="true" /></a>
              <a className="btn btn-secondary" href="#service-story">Explore services</a>
            </div>
          </div>
          <div className={styles.heroIndex} aria-label="Service categories">
            {cubeitServices.map((service) => (
              <a href={`#${service.slug}`} key={service.slug}>
                <span>{service.index}</span>
                {service.title}
              </a>
            ))}
          </div>
        </section>

        <section className={styles.introGrid} id="services" aria-labelledby="service-principles-title">
          <div className={styles.sectionLead}>
            <span className={styles.eyebrow}>How we think</span>
            <h2 id="service-principles-title">The service is not a list. It is a connected delivery system.</h2>
          </div>
          <div className={styles.principleGrid}>
            {servicePrinciples.map((principle, index) => (
              <article key={principle.label}>
                <span>{String(index + 1).padStart(2, "0")} / {principle.label}</span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          ref={immersiveRef}
          className={styles.immersiveRegion}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setPointer(0, 0)}
        >
          {!reducedMotion && desktop3D ? (
            <div className={styles.canvasStage} aria-hidden="true">
              <ServicesCanvas timelineRef={timelineRef} selectedIndex={selectedIndex} reducedMotion={reducedMotion} />
            </div>
          ) : null}

          <section ref={introRef} className={styles.immersiveIntro} aria-labelledby="immersive-title">
            <div className={styles.immersiveLeft}>
              <span className={styles.eyebrow}>Immersive service system</span>
              <h2 id="immersive-title">The cube is the model: strategy, product and engineering locked together.</h2>
            </div>
            <div className={styles.immersiveRight}>
              <p>
                Each service exposes a different face of the same CubeIT operating method. The scroll story keeps the object anchored while the business context moves around it.
              </p>
            </div>
          </section>

          <section ref={storyRef} className={styles.storySection} id="service-story" aria-labelledby="story-title">
            <div className={styles.storyHeading}>
              <span className={styles.eyebrow}>Sticky 3D service story</span>
              <h2 id="story-title">Every capability rotates around the same delivery core.</h2>
            </div>
            <div className={styles.storyRows}>
              {cubeitServices.map((service, index) => (
                <article className={styles.storyRow} id={service.slug} key={service.slug}>
                  <div>
                    <span>{service.index} / {service.label}</span>
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.summary}</p>
                  <ServiceMedia service={service} image={service.images[index % service.images.length]} priority={index === 0} />
                </article>
              ))}
            </div>
          </section>

          <section
            ref={horizontalRef}
            className={styles.horizontalSection}
            style={horizontalHeight ? { "--services-horizontal-height": `${horizontalHeight}px` } as CSSProperties : undefined}
            aria-labelledby="horizontal-title"
          >
            <div ref={horizontalViewportRef} className={styles.horizontalViewport}>
              <div className={styles.horizontalHeader}>
                <span className={styles.eyebrow}>Kinetic service wall</span>
                <h2 id="horizontal-title">A horizontal exhibition pulled by vertical scroll.</h2>
              </div>
              <div ref={horizontalTrackRef} className={styles.horizontalTrack}>
                {horizontalPanels.map((panel, index) => (
                  <HorizontalPanelView panel={panel} index={index} key={`${panel.service.slug}-${panel.type}-${index}`} />
                ))}
              </div>
            </div>
          </section>

          <section ref={selectorRef} className={styles.selectorSection} aria-labelledby="selector-title">
            <span className={styles.eyebrow}>Choose a capability</span>
            <h2 id="selector-title">Select the face of CubeIT your business needs first.</h2>
            <div className={styles.selectorButtons} role="tablist" aria-label="CubeIT service selector">
              {cubeitServices.map((service, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedIndex === index}
                  key={service.slug}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span>{service.index}</span>
                  {service.title}
                </button>
              ))}
            </div>
            <article className={styles.selectedService} data-accent={selectedService.accent}>
              <div>
                <span className={styles.kicker}>{selectedService.label}</span>
                <h3>{selectedService.thesis}</h3>
                <p>{selectedService.outcome}</p>
              </div>
              <ul>
                {selectedService.capabilities.map((item) => (
                  <li key={item}><CheckCircle2 aria-hidden="true" /> {item}</li>
                ))}
              </ul>
            </article>
          </section>
        </section>

        <section className={styles.matrixSection} aria-labelledby="matrix-title">
          <div className={styles.sectionLead}>
            <span className={styles.eyebrow}>Delivery matrix</span>
            <h2 id="matrix-title">The supporting structure behind the service.</h2>
          </div>
          <div className={styles.matrixGrid}>
            {deliveryMatrix.map((column, index) => (
              <article key={column.heading}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{column.heading}</h3>
                <ul>
                  {column.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.deepDiveSection} aria-labelledby="deep-dive-title">
          <div className={styles.deepDiveHead}>
            <span className={styles.eyebrow}>Service deep dives</span>
            <h2 id="deep-dive-title">Quiet detail after the kinetic system.</h2>
          </div>
          {cubeitServices.map((service) => (
            <article className={styles.deepDiveRow} key={service.slug}>
              <div>
                <span>{service.index}</span>
                <h3>{service.title}</h3>
              </div>
              <p>{service.summary}</p>
              <div className={styles.deepDiveMeta}>
                {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <ul>
                {service.technologies.map((technology) => <li key={technology}>{technology}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section className={styles.ctaSection} aria-labelledby="services-cta-title">
          <div className={styles.ctaCopy}>
            <span className={styles.eyebrow}>Build with CubeIT</span>
            <h2 id="services-cta-title">Bring the work into one intelligent system.</h2>
            <p>Tell us what is scattered, slow or difficult to scale. We will help shape the service path that should happen next.</p>
            <a className="btn btn-primary" href="/contact">Start a project <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className={styles.ctaCubes} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                style={{
                  "--x": `${((index % 4) - 1.5) * 78}px`,
                  "--y": `${(Math.floor(index / 4) - 1) * 82}px`,
                  "--r": `${index * 13}deg`,
                } as CSSProperties}
              >
                <Layers3 />
              </span>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
