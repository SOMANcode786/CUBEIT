"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, Check, ChevronDown, ChevronUp, Code2, Cpu, FlaskConical, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import DotField from "@/components/react-bits/dot-field";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ThreeDMarquee, type ThreeDMarqueeItem } from "@/components/ui/3d-marquee";
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
    id: "mizan",
    title: "MIZAN",
    subtitle: "AI Legal Case Management System",
    eyebrow: "AI Legal Intelligence",
    badge: "Enterprise V1.0",
    category: "AI Products",
    image: "/projects/mizan-legal.jpg",
    context: "Drafting, evidence vaults, hearing schedules, and secure matter workflows in one unified legal operating system.",
    stack: [["Python", "/logos-png/python.png"], ["React", "/logos-png/react.png"], ["Postgres", "/logos-png/postgresql.png"]],
    gridClass: "lg:col-span-8 lg:row-span-2",
    featured: true,
    highlights: ["AI Case Drafting", "Evidence Vault", "Deadline Automation"],
  },
  {
    id: "shopiq",
    title: "ShopIQ",
    subtitle: "Retail & Inventory Intelligence",
    eyebrow: "Retail Operations",
    badge: "Production Concept",
    category: "Business Platforms",
    image: "/projects/shopiq.jpg",
    context: "Live stock movement, predictive demand forecasting, and multi-branch performance analytics for retail.",
    stack: [["Next.js", "/logos-png/nextjs.png"], ["Node.js", "/logos-png/nodejs.png"], ["Postgres", "/logos-png/postgresql.png"]],
    gridClass: "lg:col-span-4 lg:row-span-1",
    featured: false,
    highlights: ["Demand Forecasting", "Real-time Stock"],
  },
  {
    id: "clinova",
    title: "Clinova",
    subtitle: "Hospital & Clinic Operations",
    eyebrow: "Healthcare Systems",
    badge: "Production Concept",
    category: "Enterprise Software",
    image: "/projects/clinova.jpg",
    context: "A calmer patient journey connecting appointments, medical records, billing, and clinical documentation.",
    stack: [["React", "/logos-png/react.png"], ["TypeScript", "/logos-png/typescript.png"], ["Docker", "/logos-png/docker.png"]],
    gridClass: "lg:col-span-4 lg:row-span-1",
    featured: false,
    highlights: ["EHR Sync", "Patient Portal"],
  },
  {
    id: "documind",
    title: "DocuMind",
    subtitle: "AI Document Intelligence",
    eyebrow: "Document Automation",
    badge: "Enterprise V1.0",
    category: "AI Products",
    image: "/projects/documind.jpg",
    context: "OCR, semantic search, automated approval routing, and document chat for high-volume operations.",
    stack: [["Python", "/logos-png/python.png"], ["Next.js", "/logos-png/nextjs.png"], ["Docker", "/logos-png/docker.png"]],
    gridClass: "lg:col-span-7 lg:row-span-1",
    featured: false,
    highlights: ["Semantic Search", "OCR Pipeline"],
  },
  {
    id: "buildgrid",
    title: "BuildGrid",
    subtitle: "Construction Project Control",
    eyebrow: "Site Operations",
    badge: "Field Operations",
    category: "Automation",
    image: "/projects/buildgrid.jpg",
    context: "Field progress tracking, budget management, procurement, and contractor activity in real time.",
    stack: [["TypeScript", "/logos-png/typescript.png"], ["Node.js", "/logos-png/nodejs.png"], ["Postgres", "/logos-png/postgresql.png"]],
    gridClass: "lg:col-span-5 lg:row-span-1",
    featured: false,
    highlights: ["Field Sync", "Budget Control"],
  },
  {
    id: "supportiq",
    title: "SupportIQ",
    subtitle: "AI Support & Ticket Intelligence",
    eyebrow: "Support Infrastructure",
    badge: "Enterprise V1.0",
    category: "Internal Tools",
    image: "/projects/supportiq.jpg",
    context: "Autonomous conversation routing, ticket intelligence, support knowledge graphs, and real-time agent copilot.",
    stack: [["React", "/logos-png/react.png"], ["Python", "/logos-png/python.png"], ["Tailwind", "/logos-png/tailwind.png"]],
    gridClass: "lg:col-span-12 lg:row-span-1",
    featured: false,
    wideBanner: true,
    highlights: ["Agent Copilot", "Ticket Routing", "Knowledge Graph"],
  },
];

const WORK_CATEGORIES = [
  "All",
  "AI Products",
  "Enterprise Software",
  "Business Platforms",
  "Automation",
  "Internal Tools",
] as const;

function WorkCard({
  work,
  originalIndex,
  animationIndex,
  isBento,
  reduceMotion,
}: {
  work: (typeof works)[0];
  originalIndex: number;
  animationIndex: number;
  isBento: boolean;
  reduceMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2563EB]/60 hover:shadow-[0_20px_45px_-10px_rgba(37,99,235,0.12)] dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-blue-500/60 ${
        isBento ? work.gridClass : ""
      } ${work.featured ? "p-7 lg:p-9" : work.wideBanner ? "p-7 lg:p-9" : "p-6 lg:p-7"}`}
      initial={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.52, delay: animationIndex * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {work.wideBanner ? (
        /* Wide Banner Card Layout (SupportIQ) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full z-10">
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-50/80 text-[#2563EB] border border-blue-100/80 text-[11px] font-semibold tracking-wide uppercase dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-blue-400">
                  {work.eyebrow}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/70 text-[10px] font-medium flex items-center gap-1.5 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {work.badge}
                </span>
              </div>

              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {work.title}
              </h3>
              <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider mt-1 mb-3">
                {work.subtitle}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xl">
                {work.context}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mt-4">
                {work.highlights?.map((h) => (
                  <span
                    key={h}
                    className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-md border border-slate-200/70 dark:border-slate-700/70 font-medium flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2563EB]" /> {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {work.stack.map(([name, logo]) => (
                  <span
                    key={name}
                    className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5"
                  >
                    <Image src={logo} alt={name} width={14} height={14} className="object-contain" />
                    {name}
                  </span>
                ))}
              </div>
              <a
                href="/contact"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-white group-hover:bg-[#2563EB] group-hover:border-[#2563EB] group-hover:text-white transition-all duration-200 flex items-center justify-center"
                aria-label={`Explore ${work.title}`}
              >
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 h-[240px] lg:h-[300px]">
              <motion.div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${work.image})` }}
                animate={hovered && !reduceMotion ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="absolute top-3 left-3 text-[10px] font-mono font-medium text-slate-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
                06
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Bento Card (Large, Medium, Wide) */
        <div className="flex flex-col h-full justify-between space-y-6 z-10">
          {/* Screenshot / Image Area */}
          <div
            className={`relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 ${
              work.featured
                ? "h-[260px] lg:h-[340px]"
                : "h-[200px] lg:h-[230px]"
            }`}
          >
            <motion.div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${work.image})` }}
              animate={hovered && !reduceMotion ? { scale: 1.03 } : { scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-900/95 text-[#2563EB] dark:text-blue-400 border border-slate-200/80 dark:border-slate-800 text-[10px] font-semibold tracking-wider uppercase shadow-2xs">
                {work.category}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 dark:bg-black/85 text-white text-[10px] font-medium flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {work.badge}
              </span>
            </div>

            <span className="absolute bottom-3 left-3 text-[10px] font-mono font-medium text-slate-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
              {String(originalIndex + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Body Content */}
          <div className="flex flex-col justify-between flex-1 space-y-4">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2563EB] dark:text-blue-400 block mb-1">
                {work.eyebrow}
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {work.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                {work.subtitle}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {work.context}
              </p>

              {work.featured && (
                <div className="flex flex-wrap gap-2 mt-4 pt-2">
                  {work.highlights?.map((h) => (
                    <span
                      key={h}
                      className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-md border border-slate-200/70 dark:border-slate-700/70 font-medium flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#2563EB]" /> {h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                {work.stack.slice(0, 3).map(([name, logo]) => (
                  <span
                    key={name}
                    className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5"
                  >
                    <Image src={logo} alt={name} width={13} height={13} className="object-contain" />
                    {name}
                  </span>
                ))}
              </div>

              <a
                href="/contact"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-white group-hover:bg-[#2563EB] group-hover:border-[#2563EB] group-hover:text-white transition-all duration-200 flex items-center justify-center shrink-0"
                aria-label={`Explore ${work.title}`}
              >
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

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

const whySlides = [
  {
    number: "01",
    title: "Wisdom That Works for You",
    text: "Our team's experience runs deep and wide. We bring real-world know-how from across industries, turning complex challenges into working software.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "02",
    title: "Guardians of Your Code",
    text: "Every line is written to last — clean, documented, and built for the next developer, not just the next deadline.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "03",
    title: "Speed You Can Feel",
    text: "We move fast without cutting corners — from kickoff to launch, momentum never stalls.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "04",
    title: "Partners in Progress",
    text: "We don't disappear after launch. Long-term support and iteration are part of the deal.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "05",
    title: "Promises Kept, Every Time",
    text: "Deadlines are commitments, not estimates. What we say ships, ships.",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=900&q=80",
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

function OurWorkDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <div className="nav-work-wrap" ref={ref}>
      <button
        className="nav-work-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Our Work
        <ChevronDown className="nav-work-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="nav-work-menu" role="menu">
          <button className="nav-work-item" role="menuitem" onClick={() => go("client-projects")}>
            <Briefcase aria-hidden="true" />
            Client&apos;s Projects
          </button>
          <button className="nav-work-item" role="menuitem" onClick={() => go("labs-projects")}>
            <FlaskConical aria-hidden="true" />
            Labs Projects
          </button>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Fire the premium stretch-and-settle entrance animation.
    // Called only when transitioning from hidden → visible.
    const triggerReveal = () => {
      nav.classList.remove("nav--revealing");
      void nav.offsetHeight; // force reflow so animation restarts cleanly
      nav.classList.add("nav--revealing");
      nav.addEventListener(
        "animationend",
        () => nav.classList.remove("nav--revealing"),
        { once: true }
      );
    };

    const handleScroll = () => {
      const y = window.scrollY;
      const wasHidden = nav.hasAttribute("data-hidden");
      if (y < 50) {
        nav.removeAttribute("data-hidden");
        if (wasHidden) triggerReveal();
      } else if (y > lastScrollY.current) {
        nav.classList.remove("nav--revealing");
        nav.dataset.hidden = "true";
      } else {
        nav.removeAttribute("data-hidden");
        if (wasHidden) triggerReveal();
      }
      if (y > 60) {
        nav.setAttribute("data-scrolled", "true");
      } else {
        nav.removeAttribute("data-scrolled");
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header ref={navRef} className="nav-shell">
      <a className="nav-logo" href="#home" aria-label="CubeIT home"><LogoMark /></a>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <OurWorkDropdown />
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

/* ── Tech tagline data ─────────────────────────────────────────────────── */
const TECH_TERMS = [
  { label: "AI Products",         ghost: "AI"         },
  { label: "Enterprise Software", ghost: "ENTERPRISE" },
  { label: "Digital Systems",     ghost: "SYSTEMS"    },
] as const;

function TechTagline() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div
      className="tech-tagline"
      role="text"
      aria-label="AI Products · Enterprise Software · Digital Systems"
    >
      {/* Ghost word: key changes each time active changes so animation reruns */}
      {active !== null && (
        <span className="tech-tagline__ghost" aria-hidden="true" key={active}>
          {TECH_TERMS[active].ghost}
        </span>
      )}
      {TECH_TERMS.map((term, i) => (
        <Fragment key={term.label}>
          {i > 0 && (
            <span
              className="tech-tagline__sep"
              aria-hidden="true"
              style={{ animationDelay: `${0.2 + i * 0.22 - 0.08}s` } as CSSProperties}
            />
          )}
          <span
            className="tech-tagline__word-wrap"
            style={{ animationDelay: `${0.1 + i * 0.22}s` } as CSSProperties}
          >
            <span
              className="tech-tagline__term"
              data-active={active === i ? "" : undefined}
              data-dim={active !== null && active !== i ? "" : undefined}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {term.label}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <div className="hero-stack" id="home">
      <section className="hero-section page-shell">
        <div className="hero-noise" aria-hidden="true" />
        <TechTagline />
        <h1 className="hero-title" aria-label="We build the systems behind smarter companies">

          {/* ── Line 1: "We build [chips] the systems behind" ─────────────── */}
          <span className="hero-line-1">
            <span className="hero-word hero-we">We build</span>
            <span className="hero-media-chips" aria-hidden="true">
              <span className="chip-img chip-img-a"><Code2 /></span>
              <span className="chip-img chip-img-b"><Cpu /></span>
              <span className="chip-img chip-img-c"><Sparkles /></span>
            </span>
            <span className="hero-word">the systems</span>
            <span className="hero-word">behind</span>
          </span>

          {/* ── Lines 2+3: CSS grid — col1=arrow, col2=smarter/companies ─── *
           *   grid-template-columns: max-content max-content
           *   The grid automatically sizes col 1 to the scribble's rendered
           *   width at every breakpoint, so "companies" (row 2, col 2) is
           *   pixel-perfectly left-aligned with "smarter" (row 1, col 2)
           *   without any manual calc() or hard-coded pixel offsets.
           * ─────────────────────────────────────────────────────────────── */}
          <span className="hero-lines-23">

            {/* Row 1 col 1 — orange hand-drawn arrow */}
            <span className="hero-scribble" aria-hidden="true">
              <svg viewBox="0 0 260 100" fill="none">
                <path d="M12 65C52 4 105 2 105 47C105 76 137 77 150 43C166 0 106 0 80 72C119 43 190 39 240 79" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <path d="M213 57L240 79L201 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            {/* Row 1 col 2 — "smarter" + cloth reel anchor */}
            <span className="hero-smarter-group">
              <span className="hero-word">smarter</span>
              <span className="hero-video-origin" aria-hidden="true" />
            </span>

            {/* Row 2 col 2 — "companies", left-aligns with "smarter" via grid */}
            <span className="hero-line-3">
              <span className="hero-word">companies</span>
            </span>

          </span>

        </h1>
        <div className="hero-foot reveal-up">
          <p>From complex operations to clean, scalable platforms—CubeIT structures the idea, engineers the system, and prepares the business to grow.</p>
          <a href="#work" className="hero-scroll">Explore systems <ArrowUpRight /></a>
        </div>
      </section>
      <section className="reel-section" aria-label="CubeIT reel">
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
  const [activeCategory, setActiveCategory] = useState<typeof WORK_CATEGORIES[number]>("All");
  const reduced = useReducedMotion();
  const isBento = activeCategory === "All";

  const filtered = isBento
    ? works
    : works.filter((w) => w.category === activeCategory);

  return (
    <section className="work-section w-full" id="work">
      <span id="labs-projects" aria-hidden="true" className="nav-anchor" />

      <div className="mx-auto w-[min(100%-48px,1440px)]">
        {/* ── Section Heading ─────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14"
          initial={reduced ? undefined : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.76, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Small Label Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-extrabold tracking-widest uppercase mb-5 shadow-xs dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-blue-400">
            <Sparkles size={12} className="text-[#2563EB] dark:text-blue-400" aria-hidden="true" />
            THINGS WE BUILD
          </div>

          {/* Large Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-5">
            Software Built For{" "}
            <span className="text-[#2563EB] dark:text-blue-500 relative inline-block">
              Modern
              <svg
                className="absolute -bottom-2 left-0 w-full h-2 text-[#2563EB]/30"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>{" "}
            Businesses
          </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-[680px]">
            AI-powered platforms, enterprise systems, and intelligent tools—engineered for scale, refined for human work, and built for real business outcomes.
          </p>
        </motion.div>

        {/* ── Category Selector (Segmented Control) ────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-center gap-2.5 mb-16"
          role="group"
          aria-label="Filter products by category"
        >
          {WORK_CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                type="button"
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] border border-[#2563EB]"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:border-blue-300 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
                initial={reduced ? undefined : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={isActive}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {/* ── Product Showcase (Bento / Filtered Grid) ────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className={
              isBento
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
            }
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {filtered.map((work, i) => (
              <WorkCard
                key={work.id}
                work={work}
                originalIndex={works.indexOf(work)}
                animationIndex={i}
                isBento={isBento}
                reduceMotion={!!reduced}
              />
            ))}
          </motion.div>
        </AnimatePresence>
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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const slide = whySlides[index];

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % whySlides.length);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + whySlides.length) % whySlides.length);
  };

  // Auto-advance every 6 s; reset on any navigation; pause on hover/interaction
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = setTimeout(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % whySlides.length);
    }, 6000);
    return () => clearTimeout(id);
  }, [index, paused, reduceMotion]);

  return (
    <section
      className="why-section page-shell"
      id="why"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Centered header */}
      <div className="why-header reveal-up">
        <span className="pill">Why us</span>
        <h2>Why CubeIT?</h2>
        <p className="why-tagline">Because We Deliver</p>
        <p className="why-desc">We build systems that scale with your business, not just for launch day. Real expertise, clean code, and a commitment to every deadline.</p>
      </div>

      {/* Two-column carousel */}
      <div className="why-carousel reveal-card">

        {/* ── Left: stacked photo cards ── */}
        <div className="why-photos">
          <div className="why-photo-deck">
            {/* Depth layers — static, purely visual */}
            <div className="why-photo-layer why-photo-layer-2" aria-hidden="true" />
            <div className="why-photo-layer why-photo-layer-1" aria-hidden="true" />

            {/* Active photo — animated + draggable */}
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={index}
                className="why-photo-main"
                custom={direction}
                style={{ backgroundImage: `url(${slide.image})` }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, x: reduceMotion ? 0 : direction * 52 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.02, x: reduceMotion ? 0 : direction * -38 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                drag={reduceMotion ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) next();
                  else if (info.offset.x > 60) prev();
                  setPaused(true);
                }}
                aria-label={`${slide.title} — slide ${slide.number} of ${whySlides.length}`}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: slide content ── */}
        <div className="why-info">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, y: reduceMotion ? 0 : direction * 24, filter: reduceMotion ? "none" : "blur(9px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : direction * -16, filter: reduceMotion ? "none" : "blur(6px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="why-slide"
            >
              {/* Oversized watermark number */}
              <span className="why-number" aria-hidden="true">{slide.number}</span>
              <h3 className="why-slide-title">{slide.title}</h3>
              <p className="why-slide-text">{slide.text}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress + navigation */}
          <div className="why-foot">
            <span className="why-progress" aria-live="polite" aria-label={`Slide ${slide.number} of ${whySlides.length}`}>
              {slide.number} / {String(whySlides.length).padStart(2, "0")}
            </span>
            <div className="why-nav" role="group" aria-label="Carousel navigation">
              <button type="button" onClick={() => { prev(); setPaused(true); }} aria-label="Previous slide">
                <ArrowLeft />
              </button>
              <button type="button" onClick={() => { next(); setPaused(true); }} aria-label="Next slide">
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function GeminiStory() {
  const sectionRef = useRef<HTMLElement>(null);

  // MotionValues driven by GSAP scrub via onUpdate (not useScroll/useTransform)
  const pathLength1 = useMotionValue(0);
  const pathLength2 = useMotionValue(0);
  const pathLength3 = useMotionValue(0);
  const pathLength4 = useMotionValue(0);
  const pathLength5 = useMotionValue(0);

  useEffect(() => {
    // Register here so the plugin is available regardless of sibling effect order
    gsap.registerPlugin(ScrollTrigger);

    const el = sectionRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      pathLength1.set(1); pathLength2.set(1); pathLength3.set(1);
      pathLength4.set(1); pathLength5.set(1);
      return;
    }

    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    // Same stagger windows as the original useTransform mapping
    // pathN: [inputStart, inputEnd] → [0, 1]
    const windows = [
      [0,    0.72],
      [0.08, 0.78],
      [0.16, 0.84],
      [0.24, 0.90],
      [0.32, 0.96],
    ] as const;
    const setters = [pathLength1, pathLength2, pathLength3, pathLength4, pathLength5];

    // GSAP pin: section stays fixed while animation plays; releases when done
    const pin = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=300%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1.2,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        setters.forEach((mv, i) => {
          const [s, e] = windows[i];
          mv.set(clamp((p - s) / (e - s)));
        });
      },
    });

    // Signal badge animations (same timing as original, over the same scroll range)
    const signalTl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "+=300%",
        scrub: 0.35,
        invalidateOnRefresh: true,
      },
    });
    signalTl
      .fromTo(".gemini-signal-one",   { x: -42, autoAlpha: 0 }, { x: 0,   autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.04)
      .to(    ".gemini-signal-one",   { x: 24,  autoAlpha: 0,   duration: 0.10, ease: "power2.in"  }, 0.20)
      .fromTo(".gemini-signal-two",   { x: 42,  autoAlpha: 0 }, { x: 0,   autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.23)
      .to(    ".gemini-signal-two",   { x: -22, autoAlpha: 0,   duration: 0.10, ease: "power2.in"  }, 0.41)
      .fromTo(".gemini-signal-three", { y: 32,  autoAlpha: 0 }, { y: 0,   autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.45)
      .to(    ".gemini-signal-three", { y: -20, autoAlpha: 0,   duration: 0.10, ease: "power2.in"  }, 0.63)
      .fromTo(".gemini-signal-four",  { y: 28,  autoAlpha: 0 }, { y: 0,   autoAlpha: 1, duration: 0.11, ease: "power2.out" }, 0.67)
      .to(    ".gemini-signal-four",  { y: -16, autoAlpha: 0,   duration: 0.10, ease: "power2.in"  }, 0.87);

    return () => {
      pin.kill();
      signalTl.scrollTrigger?.kill();
      signalTl.kill();
    };
  }, [pathLength1, pathLength2, pathLength3, pathLength4, pathLength5]);

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
  const sectionRef  = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Enhanced globe: better atmosphere, rim lighting, slower rotation
  const globeConfig = useMemo(() => ({
    showAtmosphere: true,
    atmosphereColor: "#6B9EFF",
    atmosphereIntensity: 0.88,
    atmosphereBlur: 3,
    bumpScale: 0.8,
    autoRotateSpeed: reduceMotion ? 0 : 0.28,
    enableZoom: false,
    showWireframe: true,
    wireframeColor: "#1E63F4",
    ambientIntensity: 0.9,
    pointLightIntensity: 1.7,
    initialRotation: { x: 0.12, y: -0.72 },
  }), [reduceMotion]);

  // Subtle mouse parallax on the globe
  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    const wrap = parallaxRef.current;
    if (!section || !wrap) return;

    const onMove = (e: MouseEvent) => {
      const r  = section.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      gsap.to(wrap, {
        x: dx * 11, y: dy * 5,
        rotateY: dx * 4.5, rotateX: -dy * 2.5,
        duration: 1.4, ease: "power3.out", overwrite: "auto",
      });
    };
    const onLeave = () => {
      gsap.to(wrap, {
        x: 0, y: 0, rotateY: 0, rotateX: 0,
        duration: 1.9, ease: "power3.out", overwrite: "auto",
      });
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} className="global-cta page-shell tilt-reveal" aria-labelledby="global-cta-title">
      {/* Ambient floating particles */}
      <div className="gcta-particles" aria-hidden="true">
        {[1,2,3,4,5,6].map(n => <span key={n} className={`gcta-p gcta-p${n}`} />)}
      </div>

      <div className="global-cta-copy">
        <span className="pill">Built to travel</span>
        <h2 id="global-cta-title">One product core. Ready for every market.</h2>
        <p>We engineer secure, scalable platforms that can grow across teams, branches, industries, and regions without losing clarity.</p>

        {/* Stats: thin-divider layout with premium number hierarchy */}
        <div className="global-cta-stats" aria-label="Platform qualities">
          <div className="gcta-stat">
            <strong>24/7</strong>
            <span>intelligent operations</span>
          </div>
          <div className="gcta-divider" aria-hidden="true" />
          <div className="gcta-stat">
            <strong>1</strong>
            <span>connected source of truth</span>
          </div>
        </div>

        <a className="btn btn-primary" href="/contact">Build your platform <ArrowUpRight /></a>
      </div>

      <div className="global-globe" aria-label="CubeIT global product map">
        <div className="global-globe-halo"  aria-hidden="true" />
        <div className="global-globe-rim"   aria-hidden="true" />
        {/* parallaxRef receives GSAP x/y/rotate; inner div carries the CSS float */}
        <div ref={parallaxRef} className="global-globe-parallax">
          <div className="global-globe-float">
            <Globe3D markers={globeMarkers} config={globeConfig} className="cubeit-globe" />
          </div>
        </div>
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

      // Navbar shadow deepens on scroll through the services section
      gsap.to(".nav-shell", {
        boxShadow: "0 1px 0 rgba(8,29,73,.06), 0 2px 8px rgba(8,29,73,.08), 0 12px 32px rgba(8,29,73,.10), 0 28px 56px rgba(8,29,73,.06)",
        scrollTrigger: { trigger: ".services-section", start: "top top", end: "bottom bottom", scrub: true },
      });

      gsap.fromTo(".capability-card",
        { y: 110, rotateX: -10, opacity: 0, transformOrigin: "50% 100%" },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.05, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".capability-bento", start: "top 82%", toggleActions: "play none none reverse" } }
      );

      // NOTE: Gemini section pinning + path animation is handled inside
      // GeminiStory's own useEffect, co-located with the MotionValues.

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

function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.91 }}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          {/* Static track — subtle base ring the arc travels on */}
          <span className="scroll-to-top__track" aria-hidden="true" />
          {/* Bloom glow — blurred copy of the arc for soft light effect */}
          <span className="scroll-to-top__glow" aria-hidden="true" />
          {/* Crisp traveling gradient arc */}
          <span className="scroll-to-top__ring" aria-hidden="true" />
          {/* Navy glass inner circle + arrow icon */}
          <span className="scroll-to-top__inner">
            <ChevronUp />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
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
        <div className="hero-services-wrapper">
          <div className="hero-services-grid" aria-hidden="true" />
          <Hero />
          <Services />
        </div>
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
      <ScrollToTop />
    </>
  );
}
