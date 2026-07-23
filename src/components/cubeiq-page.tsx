"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Gauge,
  LineChart,
  MessageCircleMore,
  MousePointer2,
  Network,
  Play,
  Search,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "./cubeit-site";
import { AnimatedText } from "./AnimatedText";
import { MagneticLink } from "./MagneticLink";
import GrowthDiagnostic from "./GrowthDiagnostic";
import {
  audienceOptions,
  growthLayers,
  methodSteps,
  tools,
} from "./cubeiq.data";
import styles from "./cubeiq.module.css";

const CubeIQCanvas = dynamic(() => import("./CubeIQCanvas"), {
  ssr: false,
  loading: () => <div className={styles.canvasLoading} aria-hidden="true" />,
});

const engineSteps = [
  ["Audience understanding", "See who the right customer is, what they care about and what is stopping them."],
  ["Strategic positioning", "Turn the business offer into a message people can understand and choose."],
  ["Creative production", "Build campaign ideas, content and visual direction around the decision we want customers to make."],
  ["Campaign launch", "Reach the right people through search, social and retargeting with a controlled testing plan."],
  ["Conversion experience", "Connect attention to a page, offer and next step that make action feel easy."],
  ["Lead capture", "Collect the information the team needs without adding friction or confusing the customer."],
  ["CRM and WhatsApp follow-up", "Route every opportunity to a clear owner and respond while intent is still warm."],
  ["Measurement", "Connect channels to meaningful customer actions so decisions are based on evidence."],
  ["Optimization", "Improve the weakest connection instead of changing everything at once."],
  ["Scalable growth", "Increase investment after the system is stable, measurable and ready."],
] as const;

const deliverables = [
  ["Growth strategy", "A clear view of the customer, offer, channels, conversion path and priorities."],
  ["Campaign roadmap", "What launches first, what gets tested and what evidence decides the next move."],
  ["Creative direction", "Messaging, campaign ideas and a consistent visual system built to create action."],
  ["Execution", "Campaign setup, landing experiences, tracking, automation and follow-up working together."],
  ["Reporting that leads somewhere", "A concise view of what moved, why it moved and what the team will do next."],
  ["Connected technical support", "CubeIT can repair or build the technology layer when marketing exposes a system gap."],
] as const;

const proofSignals = [
  ["Attention quality", "Are the right people arriving — and do they understand the offer?"],
  ["Conversion movement", "Where do visitors hesitate, leave or take the next step?"],
  ["Lead handling", "How quickly and consistently are real opportunities followed up?"],
  ["Commercial learning", "Which message, channel and experience gives the business useful evidence?"],
] as const;

function dispatchTool(index: number) {
  window.dispatchEvent(new CustomEvent("cubeiq:tool", { detail: { index } }));
}

function useCubeIQMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.dataset.motion = "reduced";
      return;
    }

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-cubeiq-split]").forEach((element) => {
        const parts = element.querySelectorAll<HTMLElement>(".cubeiq-split-part");
        gsap.fromTo(
          parts,
          { yPercent: 112, rotateX: -18, opacity: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.035,
            ease: "power4.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<SVGPathElement>("[data-draw-path]").forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: path.closest("section") ?? path,
            start: "top 75%",
            end: "bottom 38%",
            scrub: 1,
          },
        });
      });

      const engineWords = gsap.utils.toArray<HTMLElement>("[data-engine-word]");
      gsap.utils.toArray<HTMLElement>("[data-engine-step]").forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 58%",
          end: "bottom 42%",
          onToggle: ({ isActive }) => {
            step.toggleAttribute("data-active", isActive);
            engineWords.forEach((word, wordIndex) => word.toggleAttribute("data-active", isActive && wordIndex === index));
            root.style.setProperty("--engine-index", String(index));
          },
        });
      });

      const systemTrack = root.querySelector<HTMLElement>("[data-system-track]");
      if (systemTrack) {
        gsap.fromTo(
          systemTrack,
          { "--track-progress": 0 },
          {
            "--track-progress": 1,
            ease: "none",
            scrollTrigger: {
              trigger: systemTrack,
              start: "top 82%",
              end: "bottom 38%",
              scrub: 1,
            },
          },
        );
      }

      const relationship = root.querySelector<HTMLElement>("[data-relationship]");
      if (relationship) {
        gsap.fromTo(
          relationship,
          { "--relationship-progress": 0 },
          {
            "--relationship-progress": 1,
            ease: "none",
            scrollTrigger: {
              trigger: relationship,
              start: "top 76%",
              end: "bottom 35%",
              scrub: 1,
            },
          },
        );
      }
    }, root);

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => {
        const triggerElement = trigger.trigger;
        if (triggerElement instanceof Element && root.contains(triggerElement)) trigger.kill();
      });
    };
  }, [rootRef]);
}

export default function CubeIQPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState(0);
  const [activeAudience, setActiveAudience] = useState(audienceOptions[0].id);
  useCubeIQMotion(rootRef);

  const audience = useMemo(
    () => audienceOptions.find((option) => option.id === activeAudience) ?? audienceOptions[0],
    [activeAudience],
  );

  const chooseTool = (index: number) => {
    setActiveTool(index);
    dispatchTool(index);
  };

  return (
    <div id="cubeiq-page" ref={rootRef} className={styles.page}>
      <Navbar />
      <CubeIQCanvas rootId="cubeiq-page" />

      <main className={styles.main}>
        <section id="home" className={styles.hero} data-canvas-state="0">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.shell}>
            <div className={styles.heroKicker} data-reveal>
              <span>CubeIT builds the engine.</span>
              <i />
              <span>CubeIQ creates the momentum.</span>
            </div>

            <div className={styles.heroHeadingWrap}>
              <AnimatedText as="h1" className={styles.heroTitle} mode="lines">
                {"Marketing that does more\nthan look busy."}
              </AnimatedText>
              <div className={styles.heroIndex} aria-hidden="true">IQ / 01</div>
            </div>

            <div className={styles.heroLower}>
              <p className={styles.heroCopy} data-reveal>
                CubeIQ connects strategy, creative, advertising, conversion, follow-up and technology into one growth system — so attention has somewhere useful to go.
              </p>
              <div className={styles.heroActions} data-reveal>
                <MagneticLink href="/contact?source=cubeiq" className={styles.primaryButton}>
                  Build my growth system <ArrowUpRight aria-hidden="true" />
                </MagneticLink>
                <MagneticLink href="#growth-engine" className={styles.textButton}>
                  Explore how it works <ArrowDown aria-hidden="true" />
                </MagneticLink>
              </div>
            </div>

            <div className={styles.heroSystem} data-reveal>
              {[
                ["01", "Strategy"], ["02", "Creative"], ["03", "Campaigns"],
                ["04", "Conversion"], ["05", "Follow-up"], ["06", "Scale"],
              ].map(([number, label]) => (
                <div key={number}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroMedia} aria-hidden="true">
            <Image
              src="/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg"
              alt=""
              width={760}
              height={520}
              priority
              sizes="(max-width: 760px) 48vw, 30vw"
            />
            <span>Attention</span>
          </div>
          <div className={styles.scrollCue} aria-hidden="true"><MousePointer2 /><span>Scroll to connect the system</span></div>
        </section>

        <section className={styles.problem} data-canvas-state="1">
          <div className={styles.shell}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>The real growth problem</p>
              <AnimatedText as="h2" className={styles.displayHeading} mode="lines">
                {"Most businesses do not need\nmore disconnected activity."}
              </AnimatedText>
              <p data-reveal>
                Ads, content, websites, sales teams and reporting can all be active while the customer journey between them remains broken.
              </p>
            </div>

            <div className={styles.brokenSystem} data-system-track>
              <div className={styles.brokenLabels} aria-hidden="true">
                <span>Click</span><span>Visit</span><span>Enquiry</span><span>Follow-up</span><span>Customer</span>
              </div>
              <svg viewBox="0 0 1200 400" role="img" aria-label="A disconnected customer journey becoming connected">
                <path className={styles.systemGhost} d="M40 210 C180 90 265 330 405 195 S640 95 760 210 S995 320 1160 165" />
                <path data-draw-path className={styles.systemPath} d="M40 210 C180 90 265 330 405 195 S640 95 760 210 S995 320 1160 165" />
                {[40, 285, 520, 760, 980, 1160].map((x, index) => (
                  <g key={x} transform={`translate(${x} ${index % 2 === 0 ? 210 : index === 1 ? 245 : 165})`}>
                    <circle className={styles.systemNodeHalo} r="26" />
                    <circle className={styles.systemNode} r="8" />
                  </g>
                ))}
              </svg>
              <div className={styles.problemSignals}>
                {[
                  ["Ads generate clicks", "but the offer is not clear."],
                  ["Content looks active", "but gives people no next step."],
                  ["Leads arrive", "but the response comes too late."],
                  ["Reports look full", "but nobody knows what created business."],
                ].map(([title, text], index) => (
                  <article key={title} data-reveal>
                    <span>0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.problemResolution} data-reveal>
              <Network aria-hidden="true" />
              <p><strong>CubeIQ connects the journey.</strong> We improve the handoff between attention, action, follow-up and learning — because growth is usually lost between the tools, not inside one channel.</p>
              <Link href="#services" className={styles.inlineLink}>See the connected services <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section id="services" className={styles.layers} data-canvas-state="2">
          <div className={styles.shell}>
            <div className={styles.layersHeader}>
              <p className={styles.eyebrow}>What CubeIQ actually does</p>
              <AnimatedText as="h2" className={styles.displayHeading} mode="lines">
                {"One growth partner.\nSix connected outcomes."}
              </AnimatedText>
            </div>

            <div className={styles.layerList}>
              {growthLayers.map((layer, index) => (
                <article className={styles.layerRow} key={layer.id} data-reveal>
                  <div className={styles.layerNumber}>{String(index + 1).padStart(2, "0")}</div>
                  <div className={styles.layerMain}>
                    <p>{layer.label}</p>
                    <h3>{layer.title}</h3>
                    <span>{layer.summary}</span>
                  </div>
                  <div className={styles.layerServices}>
                    {layer.services.map((service) => <span key={service}>{service}</span>)}
                  </div>
                  <div className={styles.layerOutcome}>
                    <small>Business outcome</small>
                    <p>{layer.outcome}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="growth-engine" className={styles.engine} data-canvas-state="2">
          <div className={styles.engineSticky}>
            <div className={styles.shell}>
              <div className={styles.engineHeader}>
                <p className={styles.eyebrow}>The CubeIQ growth engine</p>
                <h2>Attention enters.<br /><span>A learning system comes out.</span></h2>
              </div>
              <div className={styles.engineVisual} aria-hidden="true">
                <svg viewBox="0 0 700 700">
                  <circle className={styles.engineOrbitGhost} cx="350" cy="350" r="230" />
                  <circle data-draw-path className={styles.engineOrbit} cx="350" cy="350" r="230" />
                  <path data-draw-path className={styles.engineSpiral} d="M350 76 C572 82 635 301 510 444 C397 574 181 522 150 356 C123 211 244 154 351 207 C444 252 459 373 389 422 C333 461 257 428 249 363 C243 311 283 284 326 296" />
                  <rect x="286" y="286" width="128" height="128" rx="18" className={styles.engineCore} />
                  <path d="M305 333 L350 307 L395 333 L350 359 Z M305 333 V382 L350 409 V359 M395 333 V382 L350 409" className={styles.engineCube} />
                </svg>
                <div className={styles.engineWords}>
                  {engineSteps.map(([title], index) => <span data-engine-word key={title} style={{ "--engine-word-index": index } as CSSProperties}>{title}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.engineSteps}>
            {engineSteps.map(([title, description], index) => (
              <article key={title} data-engine-step>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.toolsSection} data-canvas-state="2">
          <div className={styles.shell}>
            <div className={styles.toolsIntro}>
              <p className={styles.eyebrow}>Platforms inside the system</p>
              <AnimatedText as="h2" className={styles.displayHeading} mode="lines">
                {"Not more tools.\nBetter connections between them."}
              </AnimatedText>
              <p data-reveal>
                Every platform has a specific job. CubeIQ chooses the useful combination, connects the data and makes the handoffs clear.
              </p>
            </div>

            <div className={styles.toolNetwork}>
              <div className={styles.toolOrbit} aria-hidden="true">
                <svg viewBox="0 0 680 680">
                  <circle cx="340" cy="340" r="245" />
                  <circle cx="340" cy="340" r="158" />
                  <path data-draw-path d="M95 340 C190 205 270 480 340 340 S500 160 585 340" />
                  <path data-draw-path d="M340 95 C205 190 480 270 340 340 S160 500 340 585" />
                </svg>
                <div className={styles.toolCore}><span>Cube</span><strong>IQ</strong><small>Connected growth</small></div>
              </div>

              <div className={styles.toolNodes}>
                {tools.map((tool, index) => (
                  <button
                    type="button"
                    key={tool.id}
                    className={activeTool === index ? styles.toolActive : undefined}
                    style={{ "--tool-index": index, "--tool-count": tools.length } as CSSProperties}
                    onMouseEnter={() => chooseTool(index)}
                    onFocus={() => chooseTool(index)}
                    onClick={() => chooseTool(index)}
                    aria-pressed={activeTool === index}
                  >
                    <img src={tool.icon} alt="" aria-hidden="true" />
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>

              <div className={styles.toolExplanation} data-reveal>
                <div className={styles.toolExplanationTop}>
                  <img src={tools[activeTool].icon} alt="" aria-hidden="true" />
                  <div><span>{tools[activeTool].name}</span><strong>{tools[activeTool].role}</strong></div>
                </div>
                <p>{tools[activeTool].why}</p>
                <small>Its value increases when the next step — page, CRM, follow-up or measurement — is connected.</small>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.relationship} data-canvas-state="3" data-relationship>
          <div className={styles.relationshipBackdrop} aria-hidden="true" />
          <div className={styles.shell}>
            <div className={styles.relationshipIntro}>
              <p className={styles.eyebrow}>Why CubeIT created CubeIQ</p>
              <AnimatedText as="h2" className={styles.relationshipTitle} mode="lines">
                {"The engine and the momentum\nshould know each other."}
              </AnimatedText>
            </div>

            <div className={styles.relationshipSystem}>
              <div className={styles.relationshipSide} data-reveal>
                <span>CubeIT</span>
                <h3>Builds the digital infrastructure.</h3>
                <p>Websites, applications, business systems, CRM, automation, AI, integrations, portals and analytics infrastructure.</p>
                <div>{["System", "Experience", "Data", "Automation"].map((item) => <em key={item}>{item}</em>)}</div>
              </div>

              <div className={styles.relationshipCenter} aria-hidden="true">
                <svg viewBox="0 0 420 650">
                  <path data-draw-path d="M210 30 V170 C210 220 120 230 120 310 C120 390 210 390 210 470 V620" />
                  <path data-draw-path d="M210 170 C210 220 300 230 300 310 C300 390 210 390 210 470" />
                  <path d="M149 281 L210 246 L271 281 L210 317 Z M149 281 V350 L210 386 V317 M271 281 V350 L210 386" />
                </svg>
                <span>Idea</span><span>System</span><span>Attention</span><span>Lead</span><span>Customer</span><span>Scale</span>
              </div>

              <div className={styles.relationshipSide} data-reveal>
                <span>CubeIQ</span>
                <h3>Creates demand and commercial movement.</h3>
                <p>Positioning, campaigns, creative, traffic, conversion, customer acquisition, retention and growth optimization.</p>
                <div>{["Attention", "Demand", "Conversion", "Growth"].map((item) => <em key={item}>{item}</em>)}</div>
              </div>
            </div>

            <blockquote data-reveal>
              Most agencies can run a campaign but cannot repair the system behind it. Most software teams can build a platform but do not own the demand entering it. <strong>CubeIT and CubeIQ solve both sides.</strong>
            </blockquote>
          </div>
        </section>

        <section className={styles.comparison} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.sectionIntroCompact}>
              <p className={styles.eyebrow}>A different agency model</p>
              <h2>Where traditional delivery loses the signal, CubeIQ keeps the journey intact.</h2>
            </div>

            <div className={styles.comparisonFlow}>
              <div className={styles.flowLane} data-reveal>
                <div className={styles.flowHeading}><span>Fragmented model</span><small>Signals disappear between vendors.</small></div>
                <div className={styles.flowNodes}>
                  {[
                    ["Agency", "Reports clicks"], ["Designer", "Delivers assets"], ["Developer", "Waits for a brief"], ["Sales", "Chases leads manually"],
                  ].map(([title, detail], index) => (
                    <div key={title}><i className={index > 1 ? styles.flowBroken : undefined} /><strong>{title}</strong><span>{detail}</span></div>
                  ))}
                </div>
              </div>
              <div className={`${styles.flowLane} ${styles.flowLaneConnected}`} data-reveal>
                <div className={styles.flowHeading}><span>CubeIQ connected model</span><small>One strategy, one learning loop.</small></div>
                <div className={styles.flowNodes}>
                  {[
                    ["Strategy", "Sets the commercial direction"], ["Creative", "Builds the message"], ["Technology", "Supports the journey"], ["Growth", "Learns and improves"],
                  ].map(([title, detail]) => (
                    <div key={title}><i /><strong>{title}</strong><span>{detail}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.method} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.methodHeading}>
              <p className={styles.eyebrow}>The CubeIQ method</p>
              <AnimatedText as="h2" className={styles.displayHeading} mode="lines">
                {"Launch with intent.\nImprove with evidence."}
              </AnimatedText>
              <p data-reveal>We do not launch something once and hope. Each phase creates the evidence needed for the next one.</p>
            </div>
            <div className={styles.methodTrack}>
              {methodSteps.map((step) => (
                <article key={step.number} data-reveal>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.clientExperience} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.experienceGrid}>
              <div className={styles.experienceStatement}>
                <p className={styles.eyebrow}>What working with CubeIQ feels like</p>
                <h2>Clear priorities.<br />Visible decisions.<br /><span>No mystery work.</span></h2>
                <p>Serious growth work should make the business easier to understand, not bury the team under another dashboard.</p>
              </div>
              <div className={styles.deliverableList}>
                {deliverables.map(([title, description], index) => (
                  <article key={title} data-reveal>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                    <Check aria-hidden="true" />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.proof} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.proofHeading}>
              <p className={styles.eyebrow}>Proof without performance theatre</p>
              <h2>We show the movement that matters — and the decision it creates.</h2>
              <p>No invented logos, vanity awards or anonymous revenue claims. Until approved case studies are added, this section explains the evidence CubeIQ is designed to surface.</p>
            </div>
            <div className={styles.proofSignals}>
              {proofSignals.map(([title, description], index) => (
                <article key={title} data-reveal>
                  <span>0{index + 1}</span>
                  {index === 0 && <Target aria-hidden="true" />}
                  {index === 1 && <Gauge aria-hidden="true" />}
                  {index === 2 && <MessageCircleMore aria-hidden="true" />}
                  {index === 3 && <LineChart aria-hidden="true" />}
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className={styles.exampleScenario} data-reveal>
              <span>Illustrative scenario — not a client claim</span>
              <p><strong>Before:</strong> Campaigns generate enquiries, but response time and lead ownership are unclear.</p>
              <ArrowRight aria-hidden="true" />
              <p><strong>CubeIQ focus:</strong> Connect campaign source, landing-page action, CRM assignment and WhatsApp follow-up into one measurable path.</p>
            </div>
          </div>
        </section>

        <section className={styles.audience} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.audienceHeading}>
              <p className={styles.eyebrow}>Is CubeIQ relevant to your situation?</p>
              <h2>Choose the problem that sounds most familiar.</h2>
            </div>
            <div className={styles.audienceSelector}>
              <div className={styles.audienceOptions} role="tablist" aria-label="Business growth situations">
                {audienceOptions.map((option, index) => (
                  <button
                    type="button"
                    key={option.id}
                    role="tab"
                    aria-selected={activeAudience === option.id}
                    onClick={() => setActiveAudience(option.id)}
                  >
                    <span>0{index + 1}</span>{option.label}<ChevronRight aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className={styles.audienceResponse} role="tabpanel" key={audience.id}>
                <CircleDot aria-hidden="true" />
                <p className={styles.eyebrow}>How CubeIQ would think about it</p>
                <h3>{audience.title}</h3>
                <p>{audience.body}</p>
                <Link href="#diagnostic" className={styles.inlineLink}>Diagnose my growth gaps <ArrowRight aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section id="diagnostic" className={styles.diagnosticSection} data-canvas-state="4">
          <div className={styles.shell}>
            <div className={styles.diagnosticIntro}>
              <p className={styles.eyebrow}>Start with clarity</p>
              <AnimatedText as="h2" className={styles.displayHeading} mode="lines">
                {"Find the first growth gap\nbefore buying more activity."}
              </AnimatedText>
              <p data-reveal>Answer four simple questions. The summary gives your team a useful starting direction and carries the context into the existing CubeIT contact flow.</p>
            </div>
            <GrowthDiagnostic />
          </div>
        </section>

        <section className={styles.finalCta} data-canvas-state="4">
          <div className={styles.finalGrid} aria-hidden="true" />
          <div className={styles.shell}>
            <div className={styles.finalTopline} data-reveal>
              <span>Strategy</span><i /><span>Creative</span><i /><span>Campaigns</span><i /><span>Conversion</span><i /><span>Technology</span>
            </div>
            <AnimatedText as="h2" className={styles.finalTitle} mode="lines">
              {"You do not need more disconnected marketing.\nYou need a growth system that knows where it is going."}
            </AnimatedText>
            <p data-reveal>Tell us where the business is today. CubeIQ will help identify what should happen next — and CubeIT can build the technology required to support it.</p>
            <div className={styles.finalActions} data-reveal>
              <MagneticLink href="/contact?source=cubeiq-final" className={styles.finalPrimary}>
                Build my growth system <ArrowUpRight aria-hidden="true" />
              </MagneticLink>
              <MagneticLink href="/contact?source=cubeiq-conversation" className={styles.finalSecondary}>
                Talk to CubeIQ <MessageCircleMore aria-hidden="true" />
              </MagneticLink>
            </div>
            <div className={styles.finalSeal} aria-hidden="true">
              <Workflow /><span>CubeIT</span><i /><strong>CubeIQ</strong><small>One connected partner</small>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
