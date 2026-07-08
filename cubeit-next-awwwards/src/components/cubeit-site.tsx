"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Cpu, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import DotField from "@/components/react-bits/dot-field";
import BlobCursor from "@/components/react-bits/blob-cursor";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ThreeDMarquee, type ThreeDMarqueeItem } from "@/components/ui/3d-marquee";
import { LampContainer } from "@/components/ui/lamp";
import { PinContainer } from "@/components/ui/3d-pin";
import { Cover } from "@/components/ui/cover";
import Globe3D, { type GlobeMarker } from "@/components/ui/3d-globe";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { ExpandableCards } from "@/components/ui/expandable-cards";
import ClothReel from "@/components/motion/cloth-reel";
import { CursorFill } from "@/components/motion/cursor-fill";
import ClientWorkShowcase from "@/components/client-work-showcase";

const serviceCards = [
  {
    title: "AI Products",
    copy: "Document intelligence, AI agents, predictive analytics, copilots, and automation designed around measurable business work.",
    tone: "blue",
    label: "AI systems",
    images: ["/services/photos/ai-code.png", "/services/photos/ai-team.png", "/services/photos/ai-data.png"],
    tags: ["Agents", "Document AI", "Analytics"],
  },
  {
    title: "Industry Solutions",
    copy: "Secure platforms for legal, healthcare, retail, education, construction, logistics, finance, and growing operations.",
    tone: "pink",
    label: "Business platforms",
    images: ["/services/photos/industry-clinic.png", "/services/photos/industry-construction.png", "/services/photos/industry-logistics.png"],
    tags: ["Healthcare", "Construction", "Logistics"],
  },
  {
    title: "Innovative Tools",
    copy: "Modern SaaS products, internal dashboards, creator tools, workflow systems, and digital platforms built to scale.",
    tone: "orange",
    label: "Product engineering",
    images: ["/services/photos/tools-design.png", "/services/photos/tools-workflow.png", "/services/photos/tools-software.png"],
    tags: ["SaaS", "Workflows", "Product UX"],
  },
];

const works = [
  {
    title: "MIZAN",
    caption: "AI legal case management",
    meta: "Legal intelligence · Concept",
    image: "/projects/mizan-legal.jpg",
    context: "Drafting, evidence, hearings, and secure matter workflows in one legal operating system.",
    stack: [["Python", "/logos-png/python.png"], ["React", "/logos-png/react.png"], ["Postgres", "/logos-png/postgresql.png"]],
  },
  {
    title: "ShopIQ",
    caption: "Retail and inventory intelligence",
    meta: "Forecasting · Concept",
    image: "/projects/shopiq.jpg",
    context: "Live stock movement, demand forecasting, and branch performance for modern retail teams.",
    stack: [["Next.js", "/logos-png/nextjs.png"], ["Node.js", "/logos-png/nodejs.png"], ["Postgres", "/logos-png/postgresql.png"]],
  },
  {
    title: "Clinova",
    caption: "Hospital and clinic operations",
    meta: "Healthcare systems · Concept",
    image: "/projects/clinova.jpg",
    context: "A calmer patient journey connecting appointments, records, billing, and clinical documentation.",
    stack: [["React", "/logos-png/react.png"], ["TypeScript", "/logos-png/typescript.png"], ["Docker", "/logos-png/docker.png"]],
  },
  {
    title: "DocuMind",
    caption: "AI document intelligence",
    meta: "OCR and workflows · Concept",
    image: "/projects/documind.jpg",
    context: "OCR, semantic search, approvals, and document chat for high-volume operations.",
    stack: [["Python", "/logos-png/python.png"], ["Next.js", "/logos-png/nextjs.png"], ["Docker", "/logos-png/docker.png"]],
  },
  {
    title: "BuildGrid",
    caption: "Construction project control",
    meta: "Budgets and site progress · Concept",
    image: "/projects/buildgrid.jpg",
    context: "Field progress, budgets, procurement, and contractor activity made visible in real time.",
    stack: [["TypeScript", "/logos-png/typescript.png"], ["Node.js", "/logos-png/nodejs.png"], ["Postgres", "/logos-png/postgresql.png"]],
  },
  {
    title: "SupportIQ",
    caption: "AI customer support platform",
    meta: "Agents and ticketing · Concept",
    image: "/projects/supportiq.jpg",
    context: "AI-assisted conversations, ticket routing, knowledge, and support analytics in one workspace.",
    stack: [["React", "/logos-png/react.png"], ["Python", "/logos-png/python.png"], ["Tailwind", "/logos-png/tailwind.png"]],
  },
];

const expandableProducts = [
  {
    title: "MIZAN",
    description: "AI legal case management",
    eyebrow: "Legal operations",
    image: "/projects/mizan-legal.jpg",
    features: ["AI drafting", "Evidence vault", "Deadline tracking", "Client portal"],
    detail: "Designed for law firms and legal departments that need one secure source of truth across matters, evidence, documents, hearings, and client communication.",
  },
  {
    title: "Clinova",
    description: "Connected clinic operations",
    eyebrow: "Healthcare systems",
    image: "/projects/clinova.jpg",
    features: ["Patient records", "Appointments", "Billing", "Medical documentation"],
    detail: "A modular care platform that reduces administrative friction while keeping patient, doctor, pharmacy, and finance workflows clearly connected.",
  },
  {
    title: "DocuMind",
    description: "AI document intelligence",
    eyebrow: "Knowledge automation",
    image: "/projects/documind.jpg",
    features: ["OCR", "Document chat", "Smart search", "Approval workflows"],
    detail: "Built for document-heavy teams that need to capture information, find answers, route approvals, and keep sensitive archives organized at scale.",
  },
];

const globeMarkers: GlobeMarker[] = [
  { lat: 31.52, lng: 74.35, src: "/projects/mizan-legal.jpg", label: "Lahore · Product studio" },
  { lat: 25.2, lng: 55.27, src: "/projects/shopiq.jpg", label: "Dubai · Retail systems" },
  { lat: 51.5, lng: -0.12, src: "/projects/documind.jpg", label: "London · Document intelligence" },
  { lat: 43.65, lng: -79.38, src: "/projects/clinova.jpg", label: "Toronto · Healthcare platforms" },
  { lat: 1.35, lng: 103.82, src: "/projects/buildgrid.jpg", label: "Singapore · Enterprise delivery" },
];

const principleSlides = [
  {
    cardTitle: "OPERATIONS",
    label: "01 / REAL WORK",
    title: "Built around the business problem",
    body: "A clinic needs patient flow. A retailer needs stock control. A law firm needs secure documents. We begin with how the organization actually works, then engineer the right system around it.",
    logo: "Problem first",
  },
  {
    cardTitle: "INTELLIGENCE",
    label: "02 / AI WITH PURPOSE",
    title: "Automation that earns its place",
    body: "We use AI where it removes repetitive work, reveals useful insight, and helps teams serve customers faster—not as decoration, but as dependable product infrastructure.",
    logo: "Useful intelligence",
  },
  {
    cardTitle: "SCALE",
    label: "03 / BUILT TO GROW",
    title: "One clean, connected system",
    body: "Premium interfaces, scalable architecture, dashboards, secure data, and workflow automation come together as one coherent product your team can confidently grow into.",
    logo: "System thinking",
  },
];

const blogCards = [
  ["Product note 01", "Where AI Agents Actually Improve Business Operations", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=80"],
  ["Product note 02", "Designing Enterprise Software People Want To Use", "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1100&q=80"],
  ["Product note 03", "From Scattered Workflows To One Scalable System", "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1100&q=80"],
];

const technologyDetails: Record<string, Pick<ThreeDMarqueeItem, "what" | "industryUse" | "cubeitUse">> = {
  TypeScript: {
    what: "A typed layer over JavaScript that catches invalid data and unsafe assumptions before software reaches users.",
    industryUse: "Product teams use it to make large frontends and backend services easier to change, review, and maintain.",
    cubeitUse: "It gives our AI and enterprise products dependable contracts across interfaces, APIs, workflows, and business data.",
  },
  React: {
    what: "A component-based library for building interactive user interfaces from reusable pieces of product logic.",
    industryUse: "Its mature ecosystem supports accessible interfaces, complex application state, and teams working in parallel.",
    cubeitUse: "We use React to turn demanding operational workflows into fast, coherent interfaces that remain easy to evolve.",
  },
  "Next.js": {
    what: "A full-stack React framework providing routing, server rendering, caching, image optimization, and deployment primitives.",
    industryUse: "It helps teams ship performant web products without assembling every production concern from separate tools.",
    cubeitUse: "It lets us combine premium frontend experiences with secure server features in one maintainable product foundation.",
  },
  "Node.js": {
    what: "A JavaScript runtime for APIs, event-driven services, background jobs, integrations, and real-time applications.",
    industryUse: "Companies choose it for efficient network services and shared engineering knowledge across frontend and backend teams.",
    cubeitUse: "We use it for business APIs, integrations, queues, notifications, and responsive services around our platforms.",
  },
  Python: {
    what: "A general-purpose language with exceptional libraries for artificial intelligence, data processing, and automation.",
    industryUse: "It is the dominant working language across machine learning, document processing, analytics, and scientific computing.",
    cubeitUse: "It powers our AI agents, OCR pipelines, forecasting, document intelligence, and automation-heavy backend services.",
  },
  PostgreSQL: {
    what: "An advanced open-source relational database built for consistent transactions, structured data, and powerful querying.",
    industryUse: "Businesses trust it when correctness, reporting, relationships, security, and long-term data integrity matter.",
    cubeitUse: "It anchors critical records such as cases, patients, inventory, invoices, users, permissions, and audit trails.",
  },
  Docker: {
    what: "A container platform that packages software and its dependencies into portable, repeatable environments.",
    industryUse: "Engineering teams use it to eliminate environment drift and create consistent development and deployment workflows.",
    cubeitUse: "It keeps our applications, AI services, workers, and databases predictable from local development through production.",
  },
  "Tailwind CSS": {
    what: "A utility-first styling framework for building custom interfaces directly from a controlled design vocabulary.",
    industryUse: "It accelerates consistent responsive UI work while making spacing, color, typography, and states explicit in code.",
    cubeitUse: "We use it to translate CubeIT design systems into polished interfaces without accumulating fragile one-off styles.",
  },
  "Three.js": {
    what: "A WebGL graphics library for rendering interactive 3D scenes, shaders, particles, and GPU-powered visual effects.",
    industryUse: "It makes browser graphics practical while retaining deep control over geometry, materials, cameras, and performance.",
    cubeitUse: "It powers cinematic product moments such as the elastic reel, globe, spatial transitions, and meaningful data visuals.",
  },
  Kubernetes: {
    what: "A container orchestration system that schedules, scales, repairs, and rolls out distributed application services.",
    industryUse: "Large systems rely on it for resilient deployments, service discovery, workload scaling, and infrastructure consistency.",
    cubeitUse: "We apply it when a CubeIT platform needs multi-service scale, automated recovery, and controlled enterprise deployment.",
  },
  Redis: {
    what: "An in-memory data platform used for caching, queues, sessions, rate limits, and fast real-time coordination.",
    industryUse: "It removes repeated database work and enables low-latency features across high-traffic applications.",
    cubeitUse: "We use it to accelerate dashboards, manage jobs, coordinate agents, and keep sessions and notifications responsive.",
  },
  GitHub: {
    what: "A collaborative source-control platform combining Git repositories with reviews, automation, security, and delivery workflows.",
    industryUse: "It creates a traceable engineering process where changes can be reviewed, tested, discussed, and safely released.",
    cubeitUse: "It is the operational home for our code quality, pull requests, automated checks, releases, and team collaboration.",
  },
  Vercel: {
    what: "A cloud platform optimized for modern web applications, preview deployments, edge delivery, and frontend observability.",
    industryUse: "Teams use it to shorten release cycles and measure production web performance with minimal infrastructure friction.",
    cubeitUse: "It gives our web products fast global delivery and a reviewable preview environment for every meaningful change.",
  },
  MongoDB: {
    what: "A document database that stores flexible JSON-like records instead of requiring every entity to share a rigid schema.",
    industryUse: "It fits evolving content, event, catalog, and integration data where structures change frequently.",
    cubeitUse: "We select it for flexible domains and high-variation records while retaining PostgreSQL for strongly relational workflows.",
  },
  Prisma: {
    what: "A type-safe database toolkit that turns application data models into clear queries and managed schema changes.",
    industryUse: "It reduces common query mistakes and gives TypeScript teams a readable, consistent way to work with databases.",
    cubeitUse: "It connects our product logic to relational data with safer queries, explicit models, and maintainable migrations.",
  },
  FastAPI: {
    what: "A high-performance Python framework for typed APIs, automatic documentation, validation, and asynchronous services.",
    industryUse: "AI and data teams use it to expose Python capabilities as dependable, testable production endpoints.",
    cubeitUse: "It is our bridge between intelligent models and products, serving inference, extraction, automation, and analytics APIs.",
  },
  "Google Cloud": {
    what: "A global cloud platform offering managed compute, data, security, AI, networking, and operational services.",
    industryUse: "Organizations use managed cloud infrastructure to scale reliably without owning every underlying system.",
    cubeitUse: "We use its managed services when products need secure data workloads, global infrastructure, or production AI capabilities.",
  },
  Cloudflare: {
    what: "A global edge network providing content delivery, application security, DNS, serverless compute, and traffic protection.",
    industryUse: "It places performance and security close to users while shielding applications from common network threats.",
    cubeitUse: "It helps CubeIT products load faster worldwide and adds resilient protection in front of customer-facing systems.",
  },
};

const technologyMarqueeItems = [
  { title: "TypeScript", image: "/logos/typescript.svg", badge: "Safer at scale", description: "Strong contracts keep large products predictable as teams and features grow." },
  { title: "React", image: "/logos/react.svg", badge: "Interface standard", description: "A mature ecosystem for fast, accessible, component-driven product interfaces." },
  { title: "Next.js", image: "/logos/nextdotjs.svg", badge: "Production web", description: "Rendering, routing, caching, and performance primitives in one proven framework." },
  { title: "Node.js", image: "/logos/nodedotjs.svg", badge: "Service layer", description: "Reliable APIs and real-time workflows using one language across the stack." },
  { title: "Python", image: "/logos/python.svg", badge: "AI ecosystem", description: "The industry-leading foundation for AI, automation, data, and intelligent agents." },
  { title: "PostgreSQL", image: "/logos/postgresql.svg", badge: "Trusted data", description: "Durable relational data, powerful querying, and dependable business integrity." },
  { title: "Docker", image: "/logos/docker.svg", badge: "Consistent delivery", description: "Portable environments that behave the same from development to production." },
  { title: "Tailwind CSS", image: "/logos/tailwindcss.svg", badge: "Design systems", description: "A token-friendly workflow for consistent interfaces without brittle style layers." },
  { title: "Three.js", image: "/logos/threedotjs.svg", badge: "Cinematic WebGL", description: "GPU-powered 3D experiences with a mature, widely adopted graphics foundation." },
  { title: "Kubernetes", image: "/logos/kubernetes.svg", badge: "Elastic infrastructure", description: "Orchestrates resilient services that can scale, recover, and deploy without downtime." },
  { title: "Redis", image: "/logos/redis.svg", badge: "Instant response", description: "Fast caching, sessions, queues, and real-time data for responsive business systems." },
  { title: "GitHub", image: "/logos/github.svg", badge: "Engineering workflow", description: "Version control, automated reviews, security checks, and dependable team collaboration." },
  { title: "Vercel", image: "/logos/vercel.svg", badge: "Edge delivery", description: "Global web delivery, preview environments, and measurable frontend performance." },
  { title: "MongoDB", image: "/logos/mongodb.svg", badge: "Flexible records", description: "Document-oriented storage for products whose data changes rapidly as they evolve." },
  { title: "Prisma", image: "/logos/prisma.svg", badge: "Type-safe data", description: "Clear database models and safer application queries across complex product domains." },
  { title: "FastAPI", image: "/logos/fastapi.svg", badge: "AI-ready APIs", description: "High-performance Python services for models, automation, and intelligent workflows." },
  { title: "Google Cloud", image: "/logos/googlecloud.svg", badge: "Managed cloud", description: "Secure global infrastructure, managed data, and production-grade AI capabilities." },
  { title: "Cloudflare", image: "/logos/cloudflare.svg", badge: "Secure edge", description: "Faster global access, application protection, and resilient edge networking." },
].map((item) => ({ ...item, ...technologyDetails[item.title] }));

function LogoMark({ withWord = false }: { withWord?: boolean }) {
  return (
    <div className={withWord ? "brand-lockup" : "logo-mark"} aria-label="CubeIT">
      <span className="brand-logo-tile" aria-hidden="true">
        <Image src="/brand/cubeit-logo.png" alt="" width={532} height={569} preload={!withWord} />
      </span>
      {withWord ? <strong>CubeIT</strong> : null}
    </div>
  );
}

function CubeThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [burst, setBurst] = useState(false);
  const [burstStyle, setBurstStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const saved = localStorage.getItem("cubeit-theme") === "dark" ? "dark" : "light";
    queueMicrotask(() => setTheme(saved));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleThemeChange = (next: "light" | "dark") => {
    setTheme(next);
    localStorage.setItem("cubeit-theme", next);
  };

  const handleLaunch = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setBurstStyle({
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height / 2,
      "--dx": `${window.innerWidth / 2 - (rect.left + rect.width / 2)}px`,
      "--dy": `${window.innerHeight / 2 - (rect.top + rect.height / 2)}px`,
    } as CSSProperties);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 720);
  };

  return (
    <>
      <AnimatedThemeToggler
        variant="star"
        fromCenter
        duration={720}
        theme={theme}
        onThemeChange={handleThemeChange}
        onClick={handleLaunch}
        className="theme-toggle-star"
      />
      {burst ? (
        <span className="theme-toggle-burst" style={burstStyle} aria-hidden="true">
          {theme === "dark" ? "☀" : "✦"}
        </span>
      ) : null}
    </>
  );
}

function Navbar() {
  return (
    <header className="nav-shell" data-glass>
      <a className="nav-logo" href="#home" aria-label="CubeIT home"><LogoMark /></a>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#work">Works</a>
      </nav>
      <div className="nav-actions">
        <CubeThemeToggle />
        <a className="nav-cta" href="/contact">Start a project <ArrowUpRight /></a>
      </div>
    </header>
  );
}

function SectionHeader({ eyebrow, title, subtitle, second = "See Work", secondHref = "#work" }: { eyebrow: string; title: string; subtitle: string; second?: string; secondHref?: string }) {
  return (
    <header className="section-head reveal-block">
      <span className="pill reveal-up">{eyebrow}</span>
      <h2 className="section-title reveal-title">{title}</h2>
      <p className="section-subtitle reveal-up">{subtitle}</p>
      <div className="section-actions reveal-up">
        <a className="btn btn-primary" href="/contact">Start a project <ArrowUpRight /></a>
        <a className="btn btn-secondary" href={secondHref}>{second}</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="hero-stack" id="home">
      <section className="hero-section page-shell">
        <div className="hero-noise" aria-hidden="true" />
        <p className="hero-kicker reveal-up"><span /> AI products · Enterprise software · Digital systems</p>
        <h1 className="hero-title" aria-label="We build the systems behind smarter companies">
          <span className="hero-word hero-we">We build</span>
          <span className="hero-media-chips" aria-hidden="true">
            <span className="chip-img chip-img-a"><Code2 /></span>
            <span className="chip-img chip-img-b"><Cpu /></span>
            <span className="chip-img chip-img-c"><Sparkles /></span>
          </span>
          <span className="hero-word">the systems</span>
          <span className="hero-word line-break">behind</span>
          <span className="hero-scribble" aria-hidden="true">
            <svg viewBox="0 0 260 100" fill="none">
              <path d="M12 65C52 4 105 2 105 47C105 76 137 77 150 43C166 0 106 0 80 72C119 43 190 39 240 79" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path d="M213 57L240 79L201 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="hero-word">smarter</span>
          <span className="hero-video-origin" aria-hidden="true" />
          <span className="hero-word line-break">companies</span>
        </h1>
        <div className="hero-foot reveal-up">
          <p>From complex operations to clean, scalable platforms—CubeIT structures the idea, engineers the system, and prepares the business to grow.</p>
          <a href="#work" className="hero-scroll">Explore systems <ArrowUpRight /></a>
        </div>
      </section>
      <section className="reel-section page-shell" aria-label="CubeIT reel">
        <div className="reel-target" />
      </section>
      <ClothReel
        originSelector=".hero-video-origin"
        targetSelector=".reel-target"
        stackSelector=".hero-stack"
        poster="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80"
        src="https://videos.pexels.com/video-files/3254066/3254066-uhd_2560_1440_25fps.mp4"
      />
    </div>
  );
}

function Services() {
  return (
    <section className="services-section page-shell" id="services">
      <div className="section-blob section-blob-a" aria-hidden="true" />
      <SectionHeader eyebrow="What we do" title="Intelligence, Engineered" subtitle="AI, software engineering, and product design working as one system for modern businesses." />
      <div className="service-grid">
        {serviceCards.map((card, cardIndex) => (
          <article key={card.title} className={`service-card service-card-${card.tone} reveal-card glass-card`}>
            <GlowingEffect disabled={false} proximity={110} spread={34} blur={1} borderWidth={1.4} />
            <div className="service-card-inner">
              <div className="service-art" data-tone={card.tone}>
                <span className="service-index">0{cardIndex + 1}</span>
                <div className="service-photo-stack" aria-hidden="true">
                  {card.images.map((image, imageIndex) => (
                    <figure className={`service-photo service-photo-${imageIndex + 1}`} key={image}>
                      <Image src={image} alt="" width={720} height={540} unoptimized />
                    </figure>
                  ))}
                </div>
                <span className="service-label">{card.label}</span>
              </div>
              <div className="service-bottom">
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                <div className="service-tags" aria-label={`${card.title} capabilities`}>
                  {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CoverStatement() {
  return (
    <section className="cover-statement page-shell tilt-reveal" aria-label="CubeIT delivery approach">
      <span className="pill">Delivery velocity</span>
      <h2>
        From operational friction to a <Cover className="cubeit-cover">working system</Cover>{" "}— without losing the details.
      </h2>
      <p>Our reusable product foundation accelerates delivery while every workflow, permission, and interface remains shaped around the business.</p>
    </section>
  );
}

function TechnologyStack() {
  return (
    <section className="technology-section page-shell" id="technology" aria-labelledby="technology-title">
      <div className="technology-head reveal-up">
        <span className="pill">Technology</span>
        <h2 id="technology-title">Tools we build with</h2>
        <p>Industry-standard tools selected for ecosystem maturity, long-term support, performance, and the talent available to maintain them.</p>
      </div>
      <div className="technology-marquee-shell reveal-card">
        <ThreeDMarquee items={technologyMarqueeItems} className="technology-3d-marquee" />
        <div className="technology-marquee-overlay" aria-hidden="true" />
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="work-section page-shell" id="work">
      <LampContainer className="work-lamp">
        <div className="work-lamp-copy">
          <span className="pill">Things we build</span>
          <h2>Systems For Real Business</h2>
          <p>AI-powered product concepts and enterprise platforms tailored to complex industry needs.</p>
          <div className="work-lamp-signals" aria-label="Product qualities">
            <span>AI native</span><span>Industry aware</span><span>Built to scale</span>
          </div>
        </div>
      </LampContainer>
      <div className="work-grid">
        {works.map((work) => (
          <article className="project-pin-shell reveal-card" key={work.title}>
            <PinContainer title={`Explore ${work.title}`} href="/contact" containerClassName="project-pin-container" className="project-pin-inner">
              <div className="project-pin-card">
                <div className="project-pin-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,8,15,.02), rgba(5,8,15,.5)), url(${work.image})` }} />
                <div className="project-pin-grid" aria-hidden="true" />
                <div className="project-pin-accent" aria-hidden="true" />
                <span className="project-pin-index">{String(works.indexOf(work) + 1).padStart(2, "0")}</span>
                <div className="project-pin-tech" aria-label={`${work.title} technology stack`}>
                  {work.stack.map(([name, icon]) => (
                    <span key={name}><Image src={icon} alt="" width={28} height={28} /><em>{name}</em></span>
                  ))}
                </div>
                <div className="project-pin-copy">
                  <div className="project-pin-copy-head">
                    <span>{work.meta}</span>
                    <i aria-hidden="true"><ArrowUpRight /></i>
                  </div>
                  <h3>{work.title}</h3>
                  <p>{work.caption}</p>
                  <small>{work.context}</small>
                </div>
              </div>
            </PinContainer>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductDepth() {
  const items = expandableProducts.map((product) => ({
    ...product,
    content: <p>{product.detail}</p>,
  }));

  return (
    <section className="product-depth page-shell" aria-labelledby="product-depth-title">
      <div className="product-depth-head reveal-up">
        <span className="pill">Inside the system</span>
        <h2 id="product-depth-title">Open a product brief.</h2>
        <p>Some platforms need more than a thumbnail. Expand these concepts to see the operational thinking beneath the interface.</p>
      </div>
      <div className="product-depth-cards">
        <ExpandableCards items={items} />
      </div>
    </section>
  );
}

function WhyCubeIT() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [targetActive, setTargetActive] = useState(0);
  const [flipPhase, setFlipPhase] = useState<"idle" | "out" | "in">("idle");
  const item = principleSlides[active];
  const navigate = (nextDirection: 1 | -1) => {
    if (flipPhase !== "idle") return;
    setDirection(nextDirection);
    setTargetActive((active + nextDirection + principleSlides.length) % principleSlides.length);
    setFlipPhase("out");
  };
  const handleFlipComplete = () => {
    if (flipPhase === "out") {
      setActive(targetActive);
      setFlipPhase("in");
    } else if (flipPhase === "in") {
      setFlipPhase("idle");
    }
  };

  return (
    <section className="awards-section page-shell" id="why">
      <div className="section-blob section-blob-b" aria-hidden="true" />
      <SectionHeader eyebrow="Why CubeIT" title="Software With A Point Of View" subtitle="Useful, beautiful systems shaped around real operations—not generic templates or disconnected tools." second="Our approach" secondHref="#metrics" />
      <div className="why-stage reveal-card">
        <div className="why-layout" aria-live="polite">
          <div className="award-left">
            <div className="why-card-viewport">
              <motion.div
                key={`${item.cardTitle}-${flipPhase === "in" ? "incoming" : "face"}`}
                initial={flipPhase === "in" ? { rotateY: direction > 0 ? -90 : 90, rotateZ: -2, scale: 0.97 } : false}
                animate={{ rotateY: flipPhase === "out" ? (direction > 0 ? 90 : -90) : 0, rotateZ: -2, scale: flipPhase === "out" ? 0.97 : 1 }}
                transition={{ duration: 0.42, ease: [0.45, 0, 0.55, 1] }}
                onAnimationComplete={handleFlipComplete}
                className="tilt-certificate"
              >
                <div className="principle-card-meta"><span>{item.label}</span><b>CubeIT principle</b></div>
                <h3>{item.cardTitle}</h3>
                <div className="principle-card-rule" />
                <div className="principle-card-footer"><span>Engineered by CubeIT</span><i>Structure · Build · Scale</i></div>
              </motion.div>
            </div>
          </div>
          <div className="award-right">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={item.title}
                custom={direction}
                initial={{ opacity: 0, y: direction > 0 ? 22 : -22, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: direction > 0 ? -16 : 16, filter: "blur(8px)" }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="why-copy"
              >
                <div className="award-logo-row"><span className="award-symbol">◇</span>{item.logo}</div>
                <div className="cube-trophies" aria-hidden="true"><span /><span /><span /></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="award-controls why-controls">
          <button onClick={() => navigate(-1)} disabled={flipPhase !== "idle"} aria-label="Previous principle"><ArrowLeft /></button>
          <span>{String(active + 1).padStart(2, "0")} / {String(principleSlides.length).padStart(2, "0")}</span>
          <button onClick={() => navigate(1)} disabled={flipPhase !== "idle"} aria-label="Next principle"><ArrowRight /></button>
        </div>
      </div>
    </section>
  );
}

function GeminiStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const output = reduceMotion ? [1, 1] : [0, 1];
  const pathLength1 = useTransform(scrollYProgress, [0, 0.72], output);
  const pathLength2 = useTransform(scrollYProgress, [0.08, 0.78], output);
  const pathLength3 = useTransform(scrollYProgress, [0.16, 0.84], output);
  const pathLength4 = useTransform(scrollYProgress, [0.24, 0.9], output);
  const pathLength5 = useTransform(scrollYProgress, [0.32, 0.96], output);

  return (
    <section ref={sectionRef} className="gemini-story page-shell" aria-label="Connected workflows">
      <div className="gemini-story-sticky">
        <div className="gemini-story-frame">
          <GoogleGeminiEffect
            pathLengths={[pathLength1, pathLength2, pathLength3, pathLength4, pathLength5]}
            title="Many workflows. One intelligent system."
            description="Documents, decisions, people, and data converge into a product that feels coherent from every side."
            ctaLabel="Connect your operations"
            className="cubeit-gemini"
          >
            <div className="gemini-signals" aria-hidden="true">
              <span className="gemini-signal gemini-signal-one">Documents become knowledge</span>
              <span className="gemini-signal gemini-signal-two">Decisions become direction</span>
              <span className="gemini-signal gemini-signal-three">Teams move in one rhythm</span>
              <span className="gemini-signal gemini-signal-four">One scalable core</span>
            </div>
          </GoogleGeminiEffect>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics-section page-shell" id="metrics">
      <div className="capability-head reveal-up">
        <span className="pill">One connected stack</span>
        <h2>Intelligence, experience, and infrastructure.</h2>
      </div>
      <div className="capability-bento">
        <article className="capability-card capability-card-main glass-card">
          <GlowingEffect disabled={false} proximity={120} spread={34} borderWidth={1.2} />
          <span>CubeIT operating model</span>
          <h3>AI + Engineering + Product</h3>
          <p>One product team shaping the intelligence, interface, and system beneath it.</p>
          <div className="capability-proof"><span>One roadmap</span><span>One design language</span><span>One scalable core</span></div>
          <div className="capability-orbit" aria-hidden="true"><i /><i /><i /></div>
        </article>
        <article className="capability-card capability-card-ai glass-card">
          <GlowingEffect disabled={false} proximity={90} spread={28} borderWidth={1.1} />
          <div className="capability-icon"><Sparkles /></div>
          <strong>AI</strong><h3>Useful intelligence</h3><p>Documents, decisions, support, and repetitive workflows.</p>
        </article>
        <article className="capability-card capability-card-ux glass-card">
          <GlowingEffect disabled={false} proximity={90} spread={28} borderWidth={1.1} />
          <div className="capability-icon"><Code2 /></div>
          <strong>UX</strong><h3>Calm experiences</h3><p>Complex operations translated into clear product journeys.</p>
        </article>
        <article className="capability-card capability-card-api glass-card">
          <GlowingEffect disabled={false} proximity={90} spread={28} borderWidth={1.1} />
          <div className="capability-icon"><Cpu /></div>
          <strong>API</strong><h3>Connected systems</h3><p>Scalable architecture joining teams, data, and tools.</p>
        </article>
      </div>
    </section>
  );
}

function GlobalCTA() {
  const reduceMotion = useReducedMotion();
  const globeConfig = useMemo(() => ({
    showAtmosphere: true,
    atmosphereColor: "#9f7aea",
    atmosphereIntensity: 0.88,
    atmosphereBlur: 3,
    bumpScale: 0.8,
    autoRotateSpeed: reduceMotion ? 0 : 0.28,
    enableZoom: false,
    showWireframe: true,
    wireframeColor: "#c4b5fd",
    ambientIntensity: 0.9,
    pointLightIntensity: 1.7,
    initialRotation: { x: 0.12, y: -0.72 },
  }), [reduceMotion]);

  return (
    <section className="global-cta page-shell tilt-reveal" aria-labelledby="global-cta-title">
      <div className="global-cta-copy">
        <span className="pill">Built to travel</span>
        <h2 id="global-cta-title">One product core. Ready for every market.</h2>
        <p>We engineer secure, scalable platforms that can grow across teams, branches, industries, and regions without losing clarity.</p>
        <div className="global-cta-stats" aria-label="Platform qualities">
          <span><strong>24/7</strong> intelligent operations</span>
          <span><strong>1</strong> connected source of truth</span>
        </div>
        <a className="btn btn-primary" href="/contact">Build your platform <ArrowUpRight /></a>
      </div>
      <div className="global-globe" aria-label="CubeIT global product map">
        <div className="global-globe-halo" aria-hidden="true" />
        <Globe3D markers={globeMarkers} config={globeConfig} className="cubeit-globe" />
      </div>
    </section>
  );
}

function Blog() {
  return (
    <section className="blog-section page-shell" id="blog">
      <SectionHeader eyebrow="Insights" title="Notes From The Build Room" subtitle="Product thinking on AI, automation, enterprise software, and better digital operations." second="Things we build" secondHref="#work" />
      <div className="blog-grid">
        {blogCards.map(([date, title, image]) => (
          <CardContainer containerClassName="insight-card-container reveal-card" className="insight-card-perspective" key={title}>
            <CardBody className="blog-card insight-card-body glass-card">
              <GlowingEffect disabled={false} proximity={90} spread={28} borderWidth={1.2} />
              <CardItem translateZ={28} className="blog-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(16, 10, 35, .04), rgba(42, 20, 85, .72)), url(${image})` }}>
                <span className="sr-only">Visual for {title}</span>
              </CardItem>
              <CardItem translateZ={54} className="blog-copy">
                <time>{date}</time>
                <h3>{title}</h3>
                <span className="insight-link">Read insight <ArrowUpRight /></span>
              </CardItem>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer page-shell" id="contact">
      <div className="footer-card" data-glass>
        <div className="footer-brand">
          <LogoMark withWord />
          <span className="footer-kicker">Structure the idea · Build the system · Scale the business</span>
          <p>Intelligent software for modern businesses. AI, full-stack engineering, product design, and automation under one roof.</p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Company</h3>
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#work">Things We Build</a>
            <a href="/contact">Contact</a>
          </div>
          <div>
            <h3>Legal</h3>
            <a href="#contact">Terms of Service</a>
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CubeIT All Rights Reserved</span>
          <span className="socials">◎ in 𝕏</span>
        </div>
      </div>
    </footer>
  );
}

function Backgrounds() {
  return (
    <>
      <div className="dot-field-bg" aria-hidden="true">
        <DotField
          dotRadius={1.4}
          dotSpacing={17}
          bulgeStrength={40}
          glowRadius={180}
          cursorRadius={520}
          gradientFrom="rgba(30, 142, 255, 0.13)"
          gradientTo="rgba(255, 122, 47, 0.09)"
          glowColor="rgba(255,255,255,.55)"
        />
      </div>
      <div className="blob-cursor-layer" aria-hidden="true">
        <BlobCursor />
      </div>
    </>
  );
}

function useMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, smoothWheel: true });
    const ticker = (time: number) => lenis.raf(time * 1000);
    const syncScroll = () => ScrollTrigger.update();
    lenis.on("scroll", syncScroll);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
    if (!reduce) {
      gsap.fromTo(".hero-title > *", { yPercent: 72, opacity: 0, filter: "blur(16px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.35, stagger: 0.045, ease: "expo.out", delay: 0.12 });

      gsap.utils.toArray<HTMLElement>(".reveal-title").forEach((el) => {
        gsap.fromTo(el, { y: 64, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.15, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" } });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.fromTo(el, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((el) => {
        gsap.fromTo(el, { y: 72, opacity: 0, scale: 0.975, filter: "blur(8px)" }, { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } });
      });
      gsap.utils.toArray<HTMLElement>(".tilt-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 96, rotationX: 11, scale: 0.94, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 100%" },
          { y: 0, rotationX: 0, scale: 1, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" } },
        );
      });

      gsap.to(".nav-shell", {
        backgroundColor: "rgba(244,250,255,.68)",
        backdropFilter: "blur(42px) saturate(165%)",
        scrollTrigger: { trigger: ".services-section", start: "top top", end: "bottom bottom", scrub: true },
      });

      gsap.fromTo(".capability-card",
        { y: 110, rotateX: -10, opacity: 0, transformOrigin: "50% 100%" },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.05, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".capability-bento", start: "top 82%", toggleActions: "play none none reverse" } }
      );

      const geminiTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".gemini-story",
          start: "top top",
          end: "bottom top",
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });
      geminiTimeline
        .fromTo(".gemini-signal-one", { x: -42, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.04)
        .to(".gemini-signal-one", { x: 24, autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.2)
        .fromTo(".gemini-signal-two", { x: 42, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.23)
        .to(".gemini-signal-two", { x: -22, autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.41)
        .fromTo(".gemini-signal-three", { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.45)
        .to(".gemini-signal-three", { y: -20, autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.63)
        .fromTo(".gemini-signal-four", { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.67)
        .to(".gemini-signal-four", { y: -16, autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.87);

      const lampTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-lamp",
          start: "top 88%",
          end: "bottom 42%",
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      });
      lampTimeline
        .fromTo(".work-lamp .lamp-beam-left", { x: -90, rotate: -5, scaleX: 0.72 }, { x: 0, rotate: 0, scaleX: 1, ease: "power2.out" }, 0)
        .fromTo(".work-lamp .lamp-beam-right", { x: 90, rotate: 5, scaleX: 0.72 }, { x: 0, rotate: 0, scaleX: 1, ease: "power2.out" }, 0)
        .fromTo(".work-lamp .lamp-light-line", { scaleX: 0.25, opacity: 0.3 }, { scaleX: 1, opacity: 1, ease: "power2.out" }, 0.08)
        .fromTo(".work-lamp .lamp-glow-core", { scale: 0.64, opacity: 0.32 }, { scale: 1.08, opacity: 0.9, ease: "power2.out" }, 0.1)
        .fromTo(".work-lamp-copy > *", { y: 42, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, ease: "power3.out" }, 0.18);

      gsap.utils.toArray<HTMLElement>(".project-pin-image").forEach((image) => {
        gsap.fromTo(image, { backgroundPosition: "50% 42%" }, { backgroundPosition: "50% 60%", ease: "none", scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      });

    }
    });

    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(ticker);
      lenis.off("scroll", syncScroll);
      lenis.destroy();
      context.revert();
    };
  }, []);
}

export default function CubeITSite() {
  useMotion();
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CubeIT",
    alternateName: "Qubit",
    description: "CubeIT builds AI products, enterprise software, intelligent automation, and scalable digital platforms for modern businesses.",
  }), []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <CursorFill />
      <Backgrounds />
      <Navbar />
      <main className="site-main">
        <Hero />
        <Services />
        <CoverStatement />
        <TechnologyStack />
        <Work />
        <ClientWorkShowcase />
        <ProductDepth />
        <WhyCubeIT />
        <GeminiStory />
        <Metrics />
        <GlobalCTA />
        <Blog />
        <Footer />
      </main>
    </>
  );
}
