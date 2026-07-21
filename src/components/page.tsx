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
import { CubeIQNavbar } from "./CubeIQNavbar";
import { AnimatedText } from "./AnimatedText";
import { MagneticLink } from "./MagneticLink";
import GrowthDiagnostic from "./GrowthDiagnostic";
import ClothReel from "./ClothReel";
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
  {
    title: "Understand",
    statement: "Find the real customer, the real obstacle and the clearest reason to choose you.",
    includes: ["Audience", "Offer"],
    output: "Clear direction",
  },
  {
    title: "Create",
    statement: "Turn the strategy into messages and creative people can notice and understand quickly.",
    includes: ["Positioning", "Creative"],
    output: "Demand-ready ideas",
  },
  {
    title: "Activate",
    statement: "Place the right message across search, social and retargeting with a controlled test plan.",
    includes: ["Campaigns", "Traffic"],
    output: "Qualified attention",
  },
  {
    title: "Convert",
    statement: "Connect each click to a focused page, clear action and fast CRM or WhatsApp follow-up.",
    includes: ["Landing page", "Follow-up"],
    output: "More real opportunities",
  },
  {
    title: "Learn & scale",
    statement: "Read the complete journey, improve the weak point and invest more only when the system is ready.",
    includes: ["Analytics", "Optimization"],
    output: "Repeatable growth",
  },
] as const;

const CUBEIT_REEL_VIDEO = "/client-work/cubeit-showreel.mp4";

const deliverables = [
  ["Growth strategy", "Customer, offer, channels and priorities in one clear direction."],
  ["Campaign roadmap", "What launches first, what gets tested and what decides the next move."],
  ["Creative direction", "Messaging and creative direction built to create action."],
  ["Execution", "Campaigns, pages, tracking and follow-up working together."],
  ["Reporting that leads somewhere", "What moved, why it moved and what happens next."],
  ["Connected technical support", "CubeIT can build or repair the technology behind growth."],
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
          { y: 28, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-cubeiq-split]").forEach((element) => {
        const parts = element.querySelectorAll<HTMLElement>(".cubeiq-split-part");
        gsap.fromTo(
          parts,
          {
            yPercent: 120,
            rotateX: -24,
            opacity: 0,
            filter: "blur(10px)",
            clipPath: "inset(0 0 100% 0)",
            transformOrigin: "50% 100%",
          },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            filter: "blur(0px)",
            clipPath: "inset(0 0 0% 0)",
            duration: 1.05,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          },
        );
        gsap.fromTo(
          element,
          { "--heading-sweep": 0 },
          {
            "--heading-sweep": 1,
            duration: 1.25,
            ease: "power3.inOut",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
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
            start: "top 78%",
            end: "bottom 34%",
            scrub: 1,
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

      const desktop = window.matchMedia("(min-width: 901px)").matches;
      const engineSection = root.querySelector<HTMLElement>("[data-engine-pin-section]");
      const enginePin = root.querySelector<HTMLElement>("[data-engine-pin]");
      const engineStages = gsap.utils.toArray<HTMLElement>("[data-engine-stage]");
      const engineNodes = gsap.utils.toArray<HTMLElement>("[data-engine-node]");

      const activateEngineStage = (index: number) => {
        engineStages.forEach((stage, stageIndex) => stage.toggleAttribute("data-active", stageIndex === index));
        engineNodes.forEach((node, nodeIndex) => node.toggleAttribute("data-active", nodeIndex <= index));
        enginePin?.style.setProperty("--engine-stage", String(index));
      };
      activateEngineStage(0);

      if (engineSection && enginePin) {
        if (desktop) {
          ScrollTrigger.create({
            trigger: engineSection,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 4.8, 3500)}`,
            pin: enginePin,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.65,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const index = Math.min(engineSteps.length - 1, Math.floor(progress * engineSteps.length));
              enginePin.style.setProperty("--engine-progress", progress.toFixed(4));
              activateEngineStage(index);
            },
          });
        } else {
          engineStages.forEach((stage, index) => {
            ScrollTrigger.create({
              trigger: stage,
              start: "top 62%",
              end: "bottom 38%",
              onToggle: ({ isActive }) => {
                if (isActive) activateEngineStage(index);
              },
            });
          });
        }
      }

      const relationshipSection = root.querySelector<HTMLElement>("[data-relationship-pin-section]");
      const relationshipPin = root.querySelector<HTMLElement>("[data-relationship-pin]");
      if (relationshipSection && relationshipPin) {
        const applyRelationshipProgress = (progress: number) => {
          relationshipSection.dataset.clothProgress = progress.toFixed(4);
          relationshipSection.style.setProperty("--relationship-progress", progress.toFixed(4));
          relationshipPin.style.setProperty("--relationship-progress", progress.toFixed(4));
          const phase = progress < 0.34 ? "build" : progress < 0.72 ? "connect" : "grow";
          relationshipPin.dataset.phase = phase;
        };
        applyRelationshipProgress(0);

        if (desktop) {
          ScrollTrigger.create({
            trigger: relationshipSection,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 3.25, 2450)}`,
            pin: relationshipPin,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => applyRelationshipProgress(self.progress),
          });
        } else {
          gsap.fromTo(
            relationshipPin,
            { "--relationship-progress": 0 },
            {
              "--relationship-progress": 1,
              ease: "none",
              scrollTrigger: {
                trigger: relationshipSection,
                start: "top 85%",
                end: "bottom 20%",
                scrub: 1,
                onUpdate: (self) => applyRelationshipProgress(self.progress),
              },
            },
          );
        }
      }
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      window.clearTimeout(refresh);
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
      <CubeIQNavbar />
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

        <section
          id="growth-engine"
          className={styles.engine}
          data-canvas-state="2"
          data-engine-pin-section
        >
          <div className={styles.enginePin} data-engine-pin>
            <div className={styles.engineBackdrop} aria-hidden="true" />
            <div className={styles.shell}>
              <div className={styles.engineIntro}>
                <p className={styles.eyebrow}>The CubeIQ growth engine</p>
                <AnimatedText as="h2" className={styles.engineTitle} mode="lines">
                  {"Attention becomes\na system that learns."}
                </AnimatedText>
                <p data-reveal>
                  Every stage has one job. Scroll to see attention move through the complete customer journey instead of disappearing after the click.
                </p>
              </div>

              <div className={styles.engineArchitecture}>
                <div className={styles.engineChannels} aria-label="Marketing channels entering the CubeIQ growth engine">
                  {tools.slice(0, 5).map((tool, index) => (
                    <span key={tool.id} style={{ "--channel-index": index } as CSSProperties}>
                      <img src={tool.icon} alt={tool.name} />
                    </span>
                  ))}
                  <small>Attention enters</small>
                </div>

                <div className={styles.engineMap} aria-hidden="true">
                  <svg viewBox="0 0 920 520">
                    <defs>
                      <linearGradient id="cubeiq-engine-line" x1="0" x2="1">
                        <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
                        <stop offset="0.48" stopColor="currentColor" stopOpacity="1" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0.38" />
                      </linearGradient>
                    </defs>
                    <path className={styles.engineGhostPath} d="M50 260 C160 85 250 430 350 260 C435 115 520 110 586 260 C650 405 748 75 870 260" />
                    <path pathLength="1" className={styles.engineLivePath} d="M50 260 C160 85 250 430 350 260 C435 115 520 110 586 260 C650 405 748 75 870 260" />
                    {[130, 300, 460, 620, 790].map((x, index) => (
                      <g key={x} data-engine-node transform={`translate(${x} ${index % 2 === 0 ? 218 : 302})`}>
                        <circle className={styles.engineNodeHalo} r="34" />
                        <circle className={styles.engineNode} r="10" />
                        <text y="64" textAnchor="middle">0{index + 1}</text>
                      </g>
                    ))}
                    <g className={styles.engineCoreMark} transform="translate(420 194)">
                      <path d="M40 38 L92 8 L144 38 L92 68 Z M40 38 V96 L92 126 V68 M144 38 V96 L92 126" />
                    </g>
                  </svg>
                  <div className={styles.enginePulse} />
                </div>

                <div className={styles.engineResult}>
                  <small>A learning system comes out</small>
                  {engineSteps.map((step, index) => (
                    <article key={step.title} data-engine-stage>
                      <span>0{index + 1}</span>
                      <h3>{step.title}</h3>
                      <p>{step.statement}</p>
                      <div>{step.includes.map((item) => <em key={item}>{item}</em>)}</div>
                      <strong>{step.output}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.engineProgress} aria-hidden="true">
                <i />
                {engineSteps.map((step, index) => <span key={step.title}>0{index + 1}</span>)}
              </div>
            </div>
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

        <section
          id="cubeit-cubeiq"
          className={styles.relationship}
          data-canvas-state="3"
          data-relationship-pin-section
        >
          <div className={styles.relationshipPin} data-relationship-pin>
            <div className={styles.relationshipBackdrop} aria-hidden="true" />
            <div className={styles.shell}>
              <div className={styles.relationshipIntro}>
                <p className={styles.eyebrow}>Why CubeIT created CubeIQ</p>
                <AnimatedText as="h2" className={styles.relationshipTitle} mode="lines">
                  {"CubeIT builds the engine.\nCubeIQ creates the momentum."}
                </AnimatedText>
                <p data-reveal>
                  Marketing works better when the team creating demand can also improve the technology receiving it.
                </p>
              </div>

              <div className={styles.relationshipStage}>
                <article className={styles.relationshipSide} data-side="cubeit">
                  <span>CubeIT</span>
                  <h3>Build the system.</h3>
                  <p>Websites, software, CRM, automation, AI and integrations.</p>
                  <div id="cubeiq-reel-origin" className={styles.reelOrigin} aria-hidden="true">
                    <svg viewBox="0 0 120 120"><path d="M20 38 L60 15 L100 38 L60 62 Z M20 38 V82 L60 105 V62 M100 38 V82 L60 105" /></svg>
                  </div>
                </article>

                <div id="cubeiq-reel-target" className={styles.reelTarget} aria-hidden="true">
                  <span>One connected customer journey</span>
                </div>

                <article className={styles.relationshipSide} data-side="cubeiq">
                  <span>CubeIQ</span>
                  <h3>Move the market.</h3>
                  <p>Positioning, creative, campaigns, conversion, follow-up and growth.</p>
                  <div className={styles.relationshipTools} aria-hidden="true">
                    {tools.slice(0, 4).map((tool) => <img key={tool.id} src={tool.icon} alt="" />)}
                  </div>
                </article>

                <svg className={styles.relationshipConnectors} viewBox="0 0 1200 500" aria-hidden="true">
                  <path pathLength="1" d="M70 250 C250 250 270 110 480 205" />
                  <path pathLength="1" d="M720 205 C930 110 950 250 1130 250" />
                  <path pathLength="1" d="M480 295 C400 430 800 430 720 295" />
                </svg>
              </div>

              <div className={styles.relationshipNarrative} aria-live="polite">
                <span data-phase="build">01 / Build a reliable digital system.</span>
                <span data-phase="connect">02 / Connect attention to that system.</span>
                <span data-phase="grow">03 / Learn, improve and scale together.</span>
              </div>
            </div>
          </div>

          <ClothReel
            originSelector="#cubeiq-reel-origin"
            targetSelector="#cubeiq-reel-target"
            stackSelector="#cubeit-cubeiq"
            src={CUBEIT_REEL_VIDEO}
            poster="/cubeiq-assets/surface-1shdfk7mQzw-unsplash.jpg"
          />
        </section>

        <section className={styles.comparison} data-canvas-state="3">
          <div className={styles.shell}>
            <div className={styles.sectionIntroCompact}>
              <p className={styles.eyebrow}>A different agency model</p>
             <AnimatedText as="h2" mode="lines">
  {`Where traditional delivery loses the signal,
CubeIQ keeps the journey intact.`}
</AnimatedText>
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
                <AnimatedText as="h2" mode="lines">{`Clear priorities.
Visible decisions.
No mystery work.`}</AnimatedText>
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
              <AnimatedText as="h2" mode="lines">{`We show the movement that matters —
and the decision it creates.`}</AnimatedText>
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
              <AnimatedText as="h2" mode="lines">{`Choose the problem that
sounds most familiar.`}</AnimatedText>
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
