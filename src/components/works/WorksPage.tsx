"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { CursorFill } from "@/components/motion/cursor-fill";
import { Footer, Navbar } from "@/components/cubeit-site";
import { workProjects, type WorkProject } from "./work-data";
import styles from "./works.module.css";

const ElasticMediaCanvas = dynamic(() => import("./ElasticMediaCanvas"), {
  ssr: false,
});

function canUseWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function emitHover(id: string | null) {
  window.dispatchEvent(new CustomEvent("works-media-hover", { detail: id }));
}

function emitActive(id: string | null) {
  window.dispatchEvent(new CustomEvent("works-media-active", { detail: id }));
}

function MediaFrame({ project, id }: { project: WorkProject; id: string }) {
  return (
    <figure
      className={styles.mediaFrame}
      data-elastic-media
      data-media-id={id}
      data-media-src={project.cover}
      data-image-width={project.width}
      data-image-height={project.height}
      style={{ "--media-ratio": `${project.width} / ${project.height}` } as CSSProperties}
    >
      <img className={styles.mediaImage} src={project.cover} alt={`${project.title} project visual`} loading="lazy" />
    </figure>
  );
}

export default function WorksPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [webglReady, setWebglReady] = useState(false);
  const [canvasHealthy, setCanvasHealthy] = useState(false);
  const [transitionProject, setTransitionProject] = useState<WorkProject | null>(null);
  const canvasMounted = webglReady && !reducedMotion;
  const canvasActive = canvasMounted && canvasHealthy;

  useEffect(() => {
    setWebglReady(canUseWebGL());
    const onCanvasHealth = (event: Event) => {
      setCanvasHealthy(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener("works-media-canvas-health", onCanvasHealth);

    return () => {
      emitHover(null);
      emitActive(null);
      window.removeEventListener("works-media-canvas-health", onCanvasHealth);
    };
  }, []);

  useEffect(() => {
    if (!transitionProject) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [transitionProject]);

  const groups = useMemo(() => {
    const labs = workProjects.filter((project) => project.group === "CubeIT Labs").length;
    const clients = workProjects.length - labs;
    return { labs, clients };
  }, []);

  const openProject = (event: MouseEvent<HTMLAnchorElement>, project: WorkProject) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    if (!canvasActive) {
      router.push(`/our-work/${project.slug}`);
      return;
    }

    setTransitionProject(project);
    emitActive(project.slug);
    window.setTimeout(() => {
      router.push(`/our-work/${project.slug}`);
    }, 760);
  };

  return (
    <div className={styles.page} data-webgl-active={canvasActive ? "true" : "false"}>
      <CursorFill defaultColor="#1e63f4" />
      {canvasMounted ? (
        <div className={styles.canvasLayer} aria-hidden="true">
          <ElasticMediaCanvas />
        </div>
      ) : null}

      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero} id="home" aria-labelledby="works-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles aria-hidden="true" /> CubeIT / Our Works</span>
            <h1 id="works-title">Selected systems, products and digital launches.</h1>
            <p>
              A gallery of CubeIT product concepts and client deliveries, shown as a flexible digital wall where the work itself carries the motion.
            </p>
            <div className="section-actions">
              <a className="btn btn-primary" href="#work">Explore the gallery <ArrowRight aria-hidden="true" /></a>
              <a className="btn btn-secondary" href="/contact">Start a project</a>
            </div>
          </div>
          <aside className={styles.heroAside} aria-label="Work summary">
            <dl>
              <div>
                <dt>Total works</dt>
                <dd>{String(workProjects.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Client deliveries</dt>
                <dd>{String(groups.clients).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>CubeIT labs</dt>
                <dd>{String(groups.labs).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Medium</dt>
                <dd>Web + software</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className={styles.gallery} id="work" aria-labelledby="work-gallery-title">
          <div className={styles.galleryTop}>
            <div className={styles.sectionCopy}>
              <span className={styles.eyebrow}>Elastic work wall</span>
              <h2 id="work-gallery-title">The work stays sharp. The surface carries the motion.</h2>
            </div>
            <p>
              Every cover below is a real DOM link with a synchronized WebGL plane behind it. Scroll fast and the media bends; stop and it settles back.
            </p>
          </div>

          <div className={styles.galleryGrid}>
            {workProjects.map((project, index) => (
              <a
                className={styles.projectLink}
                href={`/our-work/${project.slug}`}
                key={project.slug}
                onClick={(event) => openProject(event, project)}
                onPointerEnter={() => emitHover(project.slug)}
                onPointerLeave={() => emitHover(null)}
                onFocus={() => emitHover(project.slug)}
                onBlur={() => emitHover(null)}
              >
                <MediaFrame project={project} id={project.slug} />
                <div className={styles.projectMeta}>
                  <div className={styles.projectMetaRow}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.category} / {project.group}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.servicesBand} id="services" aria-labelledby="work-services-title">
          <div className={styles.sectionCopy}>
            <span className={styles.eyebrow}>What the work covers</span>
            <h2 id="work-services-title">Product thinking, web delivery and software systems.</h2>
            <p>
              The gallery combines CubeIT-owned product directions with client websites and transformation experiences already present in the site.
            </p>
          </div>
          <div className={styles.serviceIndex}>
            {[
              ["01", "AI products", "Legal, support, document and operational intelligence concepts."],
              ["02", "Business platforms", "Retail, clinic, construction and industry-specific systems."],
              ["03", "Client websites", "Corporate, SaaS, transformation and industrial web launches."],
              ["04", "Delivery craft", "Responsive UI, service architecture, motion and conversion pathways."],
            ].map(([number, title, copy]) => (
              <article key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {transitionProject ? (
        <div className={styles.transitionOverlay} aria-hidden="true">
          <div className={styles.transitionCard}>
            <img src={transitionProject.cover} alt="" />
            <span>Opening {transitionProject.title}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
