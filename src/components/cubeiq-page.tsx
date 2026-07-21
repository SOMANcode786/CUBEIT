"use client";
/**
 * CubeIQ page for the existing CubeIT website.
 * Place at: app/cubeiq/page.tsx
 *
 * It intentionally renders no navbar/footer. Keep those in CubeIT's shared layout.
 */
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Bot, Boxes, Check, CircleDot, Cpu, Database, Globe2, Layers3, Megaphone, MessageCircleMore, MousePointer2, PanelsTopLeft, Search, Sparkles, Workflow, } from "lucide-react";
import styles from "./cubeiq.module.css";
if (typeof window !== "undefined")
    gsap.registerPlugin(ScrollTrigger);
const ASSETS = {
    ads: "/cubeiq-assets/campaign-creators-pypeCEaJeZY-unsplash.jpg",
    analytics: "/cubeiq-assets/1981-digital-bf9sZBcGQl4-unsplash.jpg",
    strategy: "/cubeiq-assets/austin-distel-EMPZ7yRZoGw-unsplash.jpg",
    social: "/cubeiq-assets/swello-9Zx0ZeiJ6x4-unsplash.jpg",
    creative: "/cubeiq-assets/brian-j-tromp-T5Us4Q9JMZk-unsplash.jpg",
    device: "/cubeiq-assets/surface-1shdfk7mQzw-unsplash.jpg",
    feed: "/cubeiq-assets/swello-x-b2sHtCgP4-unsplash.jpg",
    logo: "/brand/cubeit-logo.png",
} as const;
const platforms = [
    ["Meta", "/cubeiq-assets/meta.svg"],
    ["Facebook", "/cubeiq-assets/facebook.svg"],
    ["Instagram", "/cubeiq-assets/instagram.svg"],
    ["Google Ads", "/cubeiq-assets/google ads.svg"],
    ["Search Console", "/cubeiq-assets/googleconsole.svg"],
    ["WhatsApp", "/cubeiq-assets/whatsapp.svg"],
    ["Shopify", "/cubeiq-assets/shopify.svg"],
] as const;
type PlatformName = (typeof platforms)[number][0];
const growth = [
    ["Attract", "Discovery", "Put your business in front of the right people."],
    ["Engage", "Attention", "Give them a reason to stop, notice and care."],
    ["Convert", "Action", "Turn interest into messages, enquiries and sales."],
    ["Reconnect", "Follow-up", "Bring interested people back instead of losing them."],
    ["Retain", "Loyalty", "Stay connected so customers return."],
    ["Scale", "Growth", "Use what works to grow smarter and faster."],
] as const;
const services = [
    {
        id: "advertising",
        title: "Performance Advertising",
        eyebrow: "Reach the right people",
        description: "We create and manage advertising that puts your business in front of people who are most likely to become customers.",
        features: ["Facebook & Instagram Ads", "Google Ads/Search", "Campaign strategy", "Audience testing", "Retargeting", "Continuous improvement"],
        image: ASSETS.ads,
        icons: ["Meta", "Facebook", "Instagram", "Google Ads"] as PlatformName[],
        variant: "feature",
        tone: "blue",
    },
    {
        id: "social",
        title: "Social Media & Content",
        eyebrow: "Stay worth following",
        description: "We help your brand stay active, relevant and worth following — with content that looks intentional and sounds human.",
        features: ["Content strategy", "Social media management", "Creative direction", "Reels & short-form content", "Captions and communication", "Community growth"],
        image: ASSETS.social,
        icons: ["Instagram", "Facebook"] as PlatformName[],
        variant: "tall",
        tone: "violet",
    },
    {
        id: "creative",
        title: "Creative & Brand Design",
        eyebrow: "Look credible everywhere",
        description: "We make sure your business looks professional, recognizable and trustworthy wherever customers see it.",
        features: ["Campaign creatives", "Social graphics", "Branding", "Visual identity", "Promotional content", "Marketing assets"],
        image: ASSETS.creative,
        icons: [] as PlatformName[],
        variant: "compact",
        tone: "amber",
    },
    {
        id: "search",
        title: "Search & SEO",
        eyebrow: "Be found at the right moment",
        description: "We help people find your business when they are already searching for what you offer.",
        features: ["Search visibility", "SEO", "Local discovery", "Google presence", "Search-focused content"],
        image: ASSETS.analytics,
        icons: ["Google Ads", "Search Console"] as PlatformName[],
        variant: "compact",
        tone: "mint",
    },
    {
        id: "website",
        title: "Website & Conversion Improvement",
        eyebrow: "Turn visits into action",
        description: "Getting visitors is not enough. We improve the experience so more visitors actually take action.",
        features: ["Landing pages", "Website improvements", "E-commerce optimization", "Better calls-to-action", "Mobile experience", "Conversion-focused design"],
        image: ASSETS.device,
        icons: ["Shopify"] as PlatformName[],
        variant: "wide",
        tone: "blue",
    },
    {
        id: "automation",
        title: "Customer Follow-Up & Automation",
        eyebrow: "Keep opportunities alive",
        description: "Not every interested customer buys immediately. We help businesses follow up automatically and stay connected.",
        features: ["WhatsApp journeys", "Lead follow-up", "CRM connections", "Re-engagement", "Automated reminders", "AI-assisted workflows"],
        image: ASSETS.strategy,
        icons: ["WhatsApp"] as PlatformName[],
        variant: "wideReverse",
        tone: "violet",
    },
] as const;
const journey = [
    ["Ad", "The right person notices you."],
    ["Landing Page / Website", "The experience makes the next step clear."],
    ["Message / Enquiry", "Interest becomes a real conversation."],
    ["Follow-Up", "Interested people are not forgotten."],
    ["Customer", "The journey turns into business."],
    ["Repeat Customer", "A good experience creates another opportunity."],
] as const;
const process = [
    ["Test", "Try clear ideas without betting everything on one guess."],
    ["Learn", "See what customers notice, click, ask and respond to."],
    ["Improve", "Strengthen the messages and experiences that work best."],
    ["Reconnect", "Bring interested people back with useful follow-up."],
    ["Scale", "Grow the parts of the system that consistently perform."],
] as const;
const overview = [
    ["Grow", Megaphone, ["Meta Ads", "Google Ads", "Campaign Strategy", "Retargeting"]],
    ["Create", Sparkles, ["Social Media", "Content Strategy", "Graphic Design", "Branding", "Reels / Short Content"]],
    ["Be Found", Search, ["SEO", "Search Strategy", "Local Visibility"]],
    ["Convert", MousePointer2, ["Landing Pages", "Website Optimization", "E-commerce Growth", "Conversion Improvement"]],
    ["Connect", MessageCircleMore, ["WhatsApp Follow-Up", "CRM", "Lead Automation", "Customer Re-engagement"]],
    ["Intelligence", BarChart3, ["Analytics", "Tracking", "AI-assisted marketing", "Marketing automation"]],
] as const;
const clients = ["Startups", "Growing businesses", "E-commerce brands", "Service businesses", "Restaurants & hospitality", "Real estate", "Professional services", "Businesses building a stronger digital presence"] as const;
const tech = [
    ["Websites", Globe2], ["Custom software", PanelsTopLeft], ["AI", Bot], ["Automation", Workflow],
    ["CRM systems", Database], ["Business tools", Boxes], ["Analytics", BarChart3], ["Integrations", Cpu],
] as const;
function useWebGL() {
    const [supported, setSupported] = useState(false);
    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            setSupported(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
        }
        catch {
            setSupported(false);
        }
    }, []);
    return supported;
}
function useVisible<T extends HTMLElement>(rootMargin = "180px") {
    const ref = useRef<T | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const node = ref.current;
        if (!node)
            return;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
        observer.observe(node);
        return () => observer.disconnect();
    }, [rootMargin]);
    return { ref, visible };
}
function Label({ children }: {
    children: React.ReactNode;
}) {
    return <span className={styles.label}><i />{children}</span>;
}
function CTA({ href, children, light = false }: {
    href: string;
    children: React.ReactNode;
    light?: boolean;
}) {
    return <Link href={href} className={`${styles.cta} ${light ? styles.ctaLight : ""}`}><span>{children}</span><i><ArrowUpRight size={17}/></i></Link>;
}
function PlatformIcon({ name }: {
    name: PlatformName;
}) {
    const item = platforms.find(([label]) => label === name);
    if (!item)
        return null;
    return <span className={styles.platformIcon} title={item[0]}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item[1]} alt={item[0]}/></span>;
}
function ScenePlane({ url, size, index, progress, pointer, compact }: {
    url: string;
    size: [
        number,
        number
    ];
    index: number;
    progress: React.MutableRefObject<number>;
    pointer: React.MutableRefObject<{
        x: number;
        y: number;
    }>;
    compact: boolean;
}) {
    const ref = useRef<THREE.Group>(null);
    const configs = useMemo(() => [
        { s: [-2.8, 1.6, -1.6], e: [-1.45, 1.05, 0.05], r: [-0.12, 0.38, -0.12], re: [-0.02, 0.06, -0.04] },
        { s: [2.9, 1.9, -2.2], e: [1.3, 1.25, -0.2], r: [0.14, -0.42, 0.13], re: [0.02, -0.05, 0.03] },
        { s: [-3.1, -1.6, -2], e: [-1.52, -1.0, -0.05], r: [-0.18, 0.34, 0.1], re: [-0.02, 0.05, 0.03] },
        { s: [3.2, -1.7, -1.5], e: [1.48, -1.0, 0.12], r: [-0.12, -0.38, -0.1], re: [-0.02, -0.05, -0.03] },
        { s: [0, 0, -3.4], e: [0, 0, 0.5], r: [0.05, 0, 0.16], re: [0, 0, 0] },
    ], []);
    useFrame((state, delta) => {
        const node = ref.current;
        if (!node)
            return;
        const cfg = configs[index];
        const p = THREE.MathUtils.smoothstep(progress.current, 0, 1);
        const strength = compact ? 0.025 : 0.08;
        const target = new THREE.Vector3(THREE.MathUtils.lerp(cfg.s[0], cfg.e[0], p) + pointer.current.x * strength * (index % 2 ? -1 : 1), THREE.MathUtils.lerp(cfg.s[1], cfg.e[1], p) + pointer.current.y * strength * .7 + Math.sin(state.clock.elapsedTime * .55 + index) * .025, THREE.MathUtils.lerp(cfg.s[2], cfg.e[2], p));
        node.position.x = THREE.MathUtils.damp(node.position.x, target.x, 5.5, delta);
        node.position.y = THREE.MathUtils.damp(node.position.y, target.y, 5.5, delta);
        node.position.z = THREE.MathUtils.damp(node.position.z, target.z, 5.5, delta);
        node.rotation.x = THREE.MathUtils.damp(node.rotation.x, THREE.MathUtils.lerp(cfg.r[0], cfg.re[0], p), 5, delta);
        node.rotation.y = THREE.MathUtils.damp(node.rotation.y, THREE.MathUtils.lerp(cfg.r[1], cfg.re[1], p), 5, delta);
        node.rotation.z = THREE.MathUtils.damp(node.rotation.z, THREE.MathUtils.lerp(cfg.r[2], cfg.re[2], p), 5, delta);
    });
    return <group ref={ref}><DreiImage url={url} scale={size} radius={0.12} transparent opacity={0.98} toneMapped={false}/><RoundedBox args={[size[0] + .035, size[1] + .035, .025]} radius={.08} smoothness={4} position={[0, 0, -.035]}><meshBasicMaterial color="#2f6fff" transparent opacity={.13}/></RoundedBox></group>;
}
function HeroScene({ progress, pointer }: {
    progress: React.MutableRefObject<number>;
    pointer: React.MutableRefObject<{
        x: number;
        y: number;
    }>;
}) {
    const group = useRef<THREE.Group>(null);
    const { size } = useThree();
    const compact = size.width < 680;
    const planes = compact
        ? [[ASSETS.ads, [2.2, 1.45]], [ASSETS.social, [1.7, 2.05]], [ASSETS.device, [2.2, 1.45]]]
        : [[ASSETS.ads, [2.25, 1.48]], [ASSETS.analytics, [1.75, 2.1]], [ASSETS.social, [1.75, 2.18]], [ASSETS.device, [2.26, 1.5]], [ASSETS.strategy, [2.46, 1.64]]];
    useFrame((state, delta) => {
        if (!group.current)
            return;
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * .025, 4.5, delta);
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.current.y * .018, 4.5, delta);
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, Math.sin(state.clock.elapsedTime * .35) * .018, 4, delta);
    });
    return <group ref={group} position={[compact ? 0 : .35, 0, 0]}>
    {planes.map(([url, planeSize], index) => <ScenePlane key={url as string} url={url as string} size={planeSize as [
        number,
        number
    ]} index={index} progress={progress} pointer={pointer} compact={compact}/>)}
    {!compact && <><Line points={[[-1.25, 1.02, -.1], [-.35, .55, .15], [.05, .05, .4]]} color="#2f6fff" lineWidth={1.1} transparent opacity={.3}/><Line points={[[1.2, 1.18, -.2], [.55, .52, .1], [.05, .05, .4]]} color="#8b7cff" lineWidth={1.1} transparent opacity={.3}/><Line points={[[-1.35, -1, -.08], [-.45, -.52, .12], [.05, .05, .4]]} color="#45cfa3" lineWidth={1.1} transparent opacity={.3}/><Line points={[[1.35, -.96, .12], [.6, -.4, .2], [.05, .05, .4]]} color="#ffb66d" lineWidth={1.1} transparent opacity={.3}/></>}
    <mesh position={[.05, .05, .65]} rotation={[.55, .4, .08]}><boxGeometry args={[.44, .44, .44]}/><meshBasicMaterial color="#2f6fff" wireframe transparent opacity={.62}/></mesh>
  </group>;
}
function HeroFallback({ priority = false }: {
    priority?: boolean;
}) {
    return <div className={styles.heroFallback}>{[ASSETS.ads, ASSETS.social, ASSETS.device].map((src, i) => <div key={src} className={styles[`fallback${i + 1}`]}><Image src={src} alt="" fill sizes="(max-width: 767px) 56vw, 40vw" priority={priority}/></div>)}<span /></div>;
}
function Hero() {
    const reduced = useReducedMotion();
    const webgl = useWebGL();
    const section = useRef<HTMLElement>(null);
    const progress = useRef(0);
    const pointer = useRef({ x: 0, y: 0 });
    const { ref: visualRef, visible } = useVisible<HTMLDivElement>("220px");
    useEffect(() => {
        if (!section.current || reduced)
            return;
        const trigger = ScrollTrigger.create({ trigger: section.current, start: "top top", end: "bottom top", scrub: true, onUpdate: self => { progress.current = self.progress; } });
        return () => trigger.kill();
    }, [reduced]);
    const move = useCallback((event: React.PointerEvent<HTMLElement>) => {
        if (reduced || event.pointerType === "touch")
            return;
        const box = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: ((event.clientX - box.left) / box.width - .5) * 2, y: ((event.clientY - box.top) / box.height - .5) * 2 };
    }, [reduced]);
    return <section ref={section} className={styles.hero} onPointerMove={move} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }} aria-labelledby="cubeiq-title">
    <div className={styles.grid}/><div className={styles.heroGlowA}/><div className={styles.heroGlowB}/>
    <div className={`${styles.shell} ${styles.heroLayout}`}>
      <motion.div className={styles.heroCopy} initial={reduced ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .82, ease: [0.16, 1, .3, 1] }}>
        <Label>CubeIQ · Digital Growth</Label>
        <h1 id="cubeiq-title" className={styles.heroTitle}>Marketing that moves<span>your business forward.</span></h1>
        <p>CubeIQ brings your advertising, content, website and customer journey together so more people discover your business, trust it and become customers.</p>
        <div className={styles.heroActions}><CTA href="/contact">Grow With CubeIQ</CTA><Link href="#what-we-do" className={styles.textLink}>Explore What We Do <ArrowDown size={17}/></Link></div>
        <div className={styles.heroSteps}>{growth.map(([title], index) => <React.Fragment key={title}><span>{title}</span>{index < growth.length - 1 && <i />}</React.Fragment>)}</div>
      </motion.div>
      <motion.div ref={visualRef} className={styles.heroVisual} initial={reduced ? false : { opacity: 0, scale: .975 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .08 }} aria-hidden="true">
        <div className={styles.canvasWrap}>{webgl && !reduced ? <Canvas camera={{ position: [0, 0, 6.9], fov: 40 }} dpr={[1, 1.5]} frameloop={visible ? "always" : "demand"} gl={{ antialias: true, alpha: true, powerPreference: "default" }} fallback={<HeroFallback priority/>}><Suspense fallback={null}><HeroScene progress={progress} pointer={pointer}/></Suspense></Canvas> : <HeroFallback priority/>}</div>
        <div className={styles.platformOrbit}>{platforms.map(([name], i) => <span key={name} className={styles[`orbit${i + 1}`]}><PlatformIcon name={name}/></span>)}</div>
        <div className={styles.systemBadge}><i />One connected growth system</div>
      </motion.div>
    </div>
    <div className={styles.scrollHint}>Scroll to connect the system<i /></div>
  </section>;
}
function SectionHeading({ label, title, accent, copy, light = false, centered = false }: {
    label: string;
    title: string;
    accent: string;
    copy?: string;
    light?: boolean;
    centered?: boolean;
}) {
    return <div className={`${styles.sectionHeading} ${centered ? styles.centered : styles.splitHeading} ${light ? styles.lightHeading : ""}`}><div><Label>{label}</Label><h2>{title}<span>{accent}</span></h2></div>{copy && <p>{copy}</p>}</div>;
}
function Problem() {
    const ref = useRef<HTMLElement>(null);
    const nodes = useRef<Array<HTMLDivElement | null>>([]);
    const lines = useRef<Array<SVGPathElement | null>>([]);
    const reduced = useReducedMotion();
    const items = [
        ["Ads run alone", "Attention arrives, but the rest of the journey is not ready.", Megaphone],
        ["Social feels separate", "Content gets posted without a clear role in growth.", Sparkles],
        ["The website loses people", "Visitors arrive, get confused and leave without acting.", PanelsTopLeft],
        ["Enquiries go quiet", "Interested customers are forgotten after the first message.", MessageCircleMore],
        ["Nobody knows what works", "Decisions rely on guesses instead of a shared view.", BarChart3],
    ] as const;
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const mm = gsap.matchMedia();
        mm.add("(min-width: 900px)", () => {
            const existingNodes = nodes.current.filter(Boolean);
            const existingLines = lines.current.filter(Boolean);
            [[-180, -65, -8], [105, -125, 7], [210, 45, 9], [-135, 130, -6], [135, 140, 5]].forEach(([x, y, rotation], i) => gsap.set(nodes.current[i], { x, y, rotation, opacity: .12, scale: .88 }));
            gsap.set(existingLines, { strokeDashoffset: 1, opacity: 0 });
            gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 72%", end: "bottom 72%", scrub: .8 } })
                .to(existingNodes, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, stagger: .035, duration: 1, ease: "power3.out" })
                .to(existingLines, { strokeDashoffset: 0, opacity: 1, stagger: .03, duration: .7 }, .5)
                .fromTo(`.${styles.problemHub}`, { scale: .85, opacity: .3 }, { scale: 1, opacity: 1, duration: .6, ease: "back.out(1.4)" }, .7);
        });
        mm.add("(max-width: 899px)", () => gsap.fromTo(nodes.current.filter(Boolean), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: .08, duration: .65, scrollTrigger: { trigger: ref.current, start: "top 75%" } }));
        return () => mm.revert();
    }, [reduced]);
    const paths = ["M500 320 C380 260 300 185 185 160", "M500 320 C560 220 650 155 790 145", "M500 320 C645 310 745 325 865 350", "M500 320 C405 390 310 470 195 500", "M500 320 C565 420 650 505 790 520"];
    return <section ref={ref} className={`${styles.section} ${styles.problem}`} aria-labelledby="problem-title"><div className={styles.shell}><SectionHeading centered label="The real problem" title="Running ads is easy." accent="Building growth is harder." copy="A great advertisement cannot fix a confusing website. More traffic means nothing if visitors do not take action."/>
    <div className={styles.problemMap}><svg viewBox="0 0 1000 640" fill="none">{paths.map((d, i) => <path key={d} ref={el => { lines.current[i] = el; }} d={d} pathLength="1"/>)}</svg>
      <div className={styles.problemHub}><span><Layers3 size={28}/></span><strong>CubeIQ</strong><small>connects the pieces</small></div>
      {items.map(([title, copy, Icon], i) => <div key={title} ref={el => { nodes.current[i] = el; }} className={`${styles.problemNode} ${styles[`problemNode${i + 1}`]}`}><div><small>0{i + 1}</small><Icon size={18}/></div><h3>{title}</h3><p>{copy}</p></div>)}
    </div><div className={styles.problemResolve}><i /><p>The answer is not more disconnected activity. <strong>It is one system with a clear next step.</strong></p></div>
  </div></section>;
}
function GrowthSystem() {
    const ref = useRef<HTMLElement>(null);
    const steps = useRef<Array<HTMLElement | null>>([]);
    const path = useRef<SVGPathElement>(null);
    const [active, setActive] = useState(0);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => {
            if (path.current)
                gsap.fromTo(path.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 62%", end: "bottom 70%", scrub: .8 } });
            steps.current.forEach((step, index) => step && ScrollTrigger.create({ trigger: step, start: "top 56%", end: "bottom 44%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) }));
        }, ref);
        return () => ctx.revert();
    }, [reduced]);
    const current = growth[active];
    return <section ref={ref} className={`${styles.section} ${styles.growth}`} aria-labelledby="growth-title"><div className={styles.growthAmbient}/><div className={`${styles.shell} ${styles.growthLayout}`}><div className={styles.growthSticky}><Label>Our growth system</Label><h2 id="growth-title">One clear journey.<span>Every part has a job.</span></h2><p>We connect discovery, trust, action and follow-up so growth does not stop after the first click.</p>
    <div className={styles.orbit}><svg viewBox="0 0 560 560" fill="none"><circle cx="280" cy="280" r="205"/><path ref={path} pathLength="1" d="M280 75 A205 205 0 1 1 279.9 75"/></svg>{growth.map(([title], index) => { const a = index / growth.length * Math.PI * 2 - Math.PI / 2; return <span key={title} data-active={index === active} style={{ left: `${50 + Math.cos(a) * 36.6}%`, top: `${50 + Math.sin(a) * 36.6}%` }}>0{index + 1}</span>; })}<div><small>{current[1]}</small><strong>{current[0]}</strong><p>{current[2]}</p></div></div>
    </div><div className={styles.growthSteps}>{growth.map(([title, micro, copy], index) => <article key={title} ref={el => { steps.current[index] = el; }} data-active={index === active}><small>0{index + 1}</small><div><span>{micro}</span><h3>{title}</h3><p>{copy}</p></div><ArrowRight /></article>)}</div></div></section>;
}
function ServiceCard({ service, index }: {
    service: (typeof services)[number];
    index: number;
}) {
    const cardRef = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    const move = (event: React.PointerEvent<HTMLElement>) => {
        if (reduced || event.pointerType === "touch" || !cardRef.current)
            return;
        const box = cardRef.current.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5;
        const y = (event.clientY - box.top) / box.height - .5;
        cardRef.current.style.setProperty("--rx", `${y * -3}deg`);
        cardRef.current.style.setProperty("--ry", `${x * 4}deg`);
        cardRef.current.style.setProperty("--gx", `${(x + .5) * 100}%`);
        cardRef.current.style.setProperty("--gy", `${(y + .5) * 100}%`);
    };
    const reset = () => {
        cardRef.current?.style.setProperty("--rx", "0deg");
        cardRef.current?.style.setProperty("--ry", "0deg");
        cardRef.current?.style.setProperty("--gx", "50%");
        cardRef.current?.style.setProperty("--gy", "50%");
    };
    return <article ref={cardRef} onPointerMove={move} onPointerLeave={reset} className={`${styles.serviceCard} ${styles[service.variant]} ${styles[service.tone]}`}>
    <div className={styles.cardShine}/><div className={styles.serviceMedia}><Image src={service.image} alt={`${service.title} visual`} fill sizes={service.variant === "feature" ? "(max-width: 900px) 100vw, 62vw" : "(max-width: 900px) 100vw, 42vw"}/><div className={styles.mediaOverlay}/><span className={styles.cardIndex}>0{index + 1}</span>{service.icons.length > 0 && <div className={styles.cardPlatforms}>{service.icons.map(name => <PlatformIcon key={name} name={name}/>)}</div>}</div>
    <div className={styles.serviceBody}><small>{service.eyebrow}</small><h3>{service.title}</h3><p>{service.description}</p><ul>{service.features.map(feature => <li key={feature}><Check size={14}/>{feature}</li>)}</ul></div>
  </article>;
}
function Services() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => {
            gsap.fromTo(`.${styles.serviceCard}`, { opacity: 0, y: 52, scale: .975 }, { opacity: 1, y: 0, scale: 1, duration: .9, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: `.${styles.servicesGrid}`, start: "top 78%" } });
            gsap.utils.toArray<HTMLElement>(`.${styles.serviceMedia} img`).forEach(image => gsap.fromTo(image, { scale: 1.08, yPercent: -2 }, { scale: 1.01, yPercent: 2, ease: "none", scrollTrigger: { trigger: image.closest(`.${styles.serviceCard}`), start: "top bottom", end: "bottom top", scrub: .6 } }));
        }, ref);
        return () => ctx.revert();
    }, [reduced]);
    return <section id="what-we-do" ref={ref} className={`${styles.section} ${styles.services}`} aria-labelledby="services-title"><div className={styles.shell}><SectionHeading label="What CubeIQ does" title="Every capability." accent="One connected outcome." copy="From the first impression to the next purchase, each service strengthens the same customer journey."/><div className={styles.servicesGrid}>{services.map((service, index) => <ServiceCard key={service.id} service={service} index={index}/>)}</div></div></section>;
}
function JourneyScene({ active }: {
    active: number;
}) {
    const group = useRef<THREE.Group>(null);
    const cards = useRef<Array<THREE.Group | null>>([]);
    const compact = useThree(state => state.size.width < 650);
    const images = [ASSETS.ads, ASSETS.device, ASSETS.strategy];
    useFrame((state, delta) => {
        if (!group.current)
            return;
        const p = active / (journey.length - 1);
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, THREE.MathUtils.lerp(-.1, .08, p), 4, delta);
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, Math.sin(state.clock.elapsedTime * .45) * .025, 4, delta);
        cards.current.forEach((card, index) => {
            if (!card)
                return;
            const startX = (index - 1) * (compact ? 1.8 : 2.4);
            const targetX = THREE.MathUtils.lerp(startX, (index - 1) * (compact ? .7 : 1.25), p);
            const targetY = THREE.MathUtils.lerp(index === 1 ? .18 : index === 0 ? .65 : -.6, (index - 1) * -.08, p);
            card.position.x = THREE.MathUtils.damp(card.position.x, targetX, 5, delta);
            card.position.y = THREE.MathUtils.damp(card.position.y, targetY, 5, delta);
            card.position.z = THREE.MathUtils.damp(card.position.z, THREE.MathUtils.lerp(-index * .6, index === 1 ? .32 : -.05, p), 5, delta);
            card.rotation.y = THREE.MathUtils.damp(card.rotation.y, (index - 1) * -.08 * (1 - p), 5, delta);
            card.rotation.z = THREE.MathUtils.damp(card.rotation.z, (index - 1) * .08 * (1 - p), 5, delta);
        });
    });
    return <group ref={group}>{images.map((url, index) => <group key={url} ref={el => { cards.current[index] = el; }}><DreiImage url={url} scale={compact ? [1.6, 2.05] : [2.05, 2.6]} radius={.14} transparent opacity={.98} toneMapped={false}/><RoundedBox args={compact ? [1.64, 2.09, .04] : [2.09, 2.64, .04]} radius={.08} smoothness={4} position={[0, 0, -.04]}><meshBasicMaterial color={index === 1 ? "#2f6fff" : index === 0 ? "#8b7cff" : "#46cfa3"} transparent opacity={.16}/></RoundedBox></group>)}<Line points={[[-1.2, -1.62, -.12], [0, -1.82, .12], [1.2, -1.62, -.12]]} color="#2f6fff" lineWidth={1.2} transparent opacity={.36}/></group>;
}
function Difference() {
    const ref = useRef<HTMLElement>(null);
    const steps = useRef<Array<HTMLElement | null>>([]);
    const [active, setActive] = useState(0);
    const reduced = useReducedMotion();
    const webgl = useWebGL();
    const { ref: canvasRef, visible } = useVisible<HTMLDivElement>();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => {
            steps.current.forEach((step, index) => step && ScrollTrigger.create({ trigger: step, start: "top 56%", end: "bottom 44%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) }));
            gsap.fromTo(`.${styles.journeyFill}`, { scaleY: 0 }, { scaleY: 1, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: `.${styles.journeySteps}`, start: "top 62%", end: "bottom 48%", scrub: true } });
        }, ref);
        return () => ctx.revert();
    }, [reduced]);
    return <section ref={ref} className={`${styles.section} ${styles.difference}`} aria-labelledby="difference-title"><div className={styles.shell}><SectionHeading light label="The CubeIQ difference" title="Most agencies stop at the ad." accent="We look at what happens next." copy="A strong campaign is only valuable when the next step is clear, helpful and connected."/>
    <div className={styles.differenceLayout}><div className={styles.differenceSticky}><div ref={canvasRef} className={styles.journeyCanvas} aria-hidden="true">{webgl && !reduced ? <Canvas camera={{ position: [0, 0, 7.2], fov: 39 }} dpr={[1, 1.35]} frameloop={visible ? "always" : "demand"} gl={{ antialias: true, alpha: true, powerPreference: "default" }}><Suspense fallback={null}><JourneyScene active={active}/></Suspense></Canvas> : <HeroFallback />}</div><div className={styles.journeyStatus}><span>0{active + 1}</span><div><small>Current moment</small><strong>{journey[active][0]}</strong></div></div></div>
    <div className={styles.journeySteps}><div className={styles.journeyLine}><span className={styles.journeyFill}/></div>{journey.map(([title, copy], index) => <article key={title} ref={el => { steps.current[index] = el; }} data-active={index === active}><i /><small>0{index + 1}</small><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
    <div className={styles.truths}><p>A great advertisement cannot fix a confusing website.</p><p>A beautiful social page cannot help if nobody follows up.</p><p>More traffic means nothing if visitors do not take action.</p><strong>CubeIQ looks at the entire journey.</strong></div>
  </div></section>;
}
function BuiltByCubeIT() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => {
            gsap.fromTo(`.${styles.techNode}`, { opacity: 0, scale: .88, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: .7, stagger: .06, ease: "back.out(1.45)", scrollTrigger: { trigger: `.${styles.techMap}`, start: "top 72%" } });
            gsap.fromTo(`.${styles.techLines} path`, { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1, stagger: .04, scrollTrigger: { trigger: `.${styles.techMap}`, start: "top 72%" } });
        }, ref);
        return () => ctx.revert();
    }, [reduced]);
    const paths = ["M380 325 C305 255 250 180 170 130", "M380 325 C420 220 505 160 590 130", "M380 325 C270 325 170 320 95 310", "M380 325 C485 325 585 320 665 310", "M380 325 C305 405 250 485 170 535", "M380 325 C425 430 505 490 590 535", "M380 325 C355 240 350 140 365 70", "M380 325 C370 430 380 530 380 590"];
    return <section ref={ref} className={`${styles.section} ${styles.built}`} aria-labelledby="built-title"><div className={styles.builtGrid}/><div className={`${styles.shell} ${styles.builtLayout}`}><div className={styles.builtCopy}><Label>Built by CubeIT</Label><div className={styles.brandRow}><Image src={ASSETS.logo} alt="CubeIT" width={112} height={34}/><i /><strong>CubeIQ</strong></div><h2 id="built-title">Marketing backed<span>by technology.</span></h2><p>Because CubeIQ is part of CubeIT, we can go further than a traditional marketing agency. When the customer journey needs a better tool, connection or workflow, we can help build it.</p><blockquote>We do not force businesses to work around disconnected tools. We can build the system around the business.</blockquote></div>
    <div className={styles.techMap} aria-label="CubeIT technology capabilities"><svg className={styles.techLines} viewBox="0 0 760 650" fill="none">{paths.map(d => <path key={d} d={d} pathLength="1"/>)}</svg><div className={styles.techCore}><span><Layers3 size={30}/></span><strong>Connected growth</strong><small>Marketing + technology</small></div>{tech.map(([label, Icon], index) => <div key={label} className={`${styles.techNode} ${styles[`techNode${index + 1}`]}`}><Icon size={19}/><span>{label}</span></div>)}</div>
  </div></section>;
}
function HowWeWork() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {
            gsap.fromTo(`.${styles.processStep}`, { opacity: .25, y: 32 }, { opacity: 1, y: 0, stagger: .12, duration: .75, ease: "power3.out", scrollTrigger: { trigger: `.${styles.processTrack}`, start: "top 74%" } });
            mm.add("(min-width: 1025px)", () => {
                gsap.fromTo(`.${styles.processFill}`, { scaleX: 0, scaleY: 1 }, { scaleX: 1, scaleY: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: `.${styles.processTrack}`, start: "top 76%", end: "bottom 60%", scrub: .8 } });
            });
            mm.add("(max-width: 1024px)", () => {
                gsap.fromTo(`.${styles.processFill}`, { scaleX: 1, scaleY: 0 }, { scaleX: 1, scaleY: 1, transformOrigin: "center top", ease: "none", scrollTrigger: { trigger: `.${styles.processTrack}`, start: "top 76%", end: "bottom 60%", scrub: .8 } });
            });
        }, ref);
        return () => { mm.revert(); ctx.revert(); };
    }, [reduced]);
    return <section ref={ref} className={`${styles.section} ${styles.how}`} aria-labelledby="how-title"><div className={styles.shell}><SectionHeading label="How we work" title="We do not launch once" accent="and hope for the best." copy="Growth improves through a clear rhythm: test an idea, learn from real behavior, strengthen what works and reconnect with people who showed interest."/><div className={styles.processTrack}><div className={styles.processLine}><span className={styles.processFill}/></div>{process.map(([title, copy], index) => <article className={styles.processStep} key={title}><small>0{index + 1}</small><i /><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>;
}
function ServicesOverview() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => gsap.fromTo(`.${styles.capability}`, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .75, stagger: .07, ease: "power3.out", scrollTrigger: { trigger: `.${styles.capabilityGrid}`, start: "top 78%" } }), ref);
        return () => ctx.revert();
    }, [reduced]);
    return <section ref={ref} className={`${styles.section} ${styles.overview}`} aria-labelledby="overview-title"><div className={styles.shell}><SectionHeading centered label="Services overview" title="Everything needed to move" accent="the customer journey forward."/><div className={styles.capabilityGrid}>{overview.map(([title, Icon, items], index) => <article className={`${styles.capability} ${styles[`capability${index + 1}`]}`} key={title}><div><span><Icon size={20}/></span><small>0{index + 1}</small></div><h3>{title}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></div></section>;
}
function IdealClients() {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => gsap.fromTo(`.${styles.clientChip}`, { opacity: 0, scale: .88, y: 12 }, { opacity: 1, scale: 1, y: 0, stagger: .055, duration: .65, ease: "back.out(1.5)", scrollTrigger: { trigger: `.${styles.clientUniverse}`, start: "top 72%" } }), ref);
        return () => ctx.revert();
    }, [reduced]);
    return <section ref={ref} className={`${styles.section} ${styles.clients}`} aria-labelledby="clients-title"><div className={styles.shell}><div className={styles.clientUniverse}><div className={styles.rings}><i /><i /><i /></div><div className={styles.clientCenter}><Label>Who CubeIQ is for</Label><h2 id="clients-title">Built for businesses ready to become<span>easier to discover, trust and choose.</span></h2><p>These are common fits, not limits. The system adapts to the business, its customers and what needs to happen next.</p></div>{clients.map((client, index) => <span key={client} className={`${styles.clientChip} ${styles[`clientChip${index + 1}`]}`}><CircleDot size={14}/>{client}</span>)}</div></div></section>;
}
function FinalCTA() {
    const ref = useRef<HTMLElement>(null);
    const images = useRef<Array<HTMLDivElement | null>>([]);
    const reduced = useReducedMotion();
    useEffect(() => {
        if (!ref.current || reduced)
            return;
        const ctx = gsap.context(() => {
            gsap.fromTo(images.current.filter(Boolean), { opacity: 0, scale: .9, x: i => i % 2 ? 85 : -85, y: i => i < 2 ? -48 : 48, rotation: i => i % 2 ? 8 : -8 }, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, stagger: .08, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 66%" } });
            gsap.fromTo(`.${styles.finalLines} path`, { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.1, stagger: .05, scrollTrigger: { trigger: ref.current, start: "top 62%" } });
        }, ref);
        return () => ctx.revert();
    }, [reduced]);
    const imageList = [ASSETS.ads, ASSETS.feed, ASSETS.device, ASSETS.strategy];
    const paths = ["M350 320 C265 255 215 180 145 135", "M350 320 C435 250 495 180 565 135", "M350 320 C265 395 215 455 145 505", "M350 320 C435 395 495 455 565 505"];
    return <section ref={ref} className={styles.final} aria-labelledby="final-title"><div className={styles.finalGrid}/><div className={styles.finalGlow}/><div className={`${styles.shell} ${styles.finalLayout}`}><div className={styles.finalCopy}><Label>The next step</Label><h2 id="final-title">You do not need more disconnected marketing.<span>You need a system that grows with your business.</span></h2><p>Tell us where your business is today. We’ll help you identify what should happen next.</p><div><CTA href="/contact" light>Build Your Growth System</CTA><Link href="/" className={`${styles.textLink} ${styles.textLinkLight}`}>Back to CubeIT <ArrowRight size={17}/></Link></div></div>
    <div className={styles.finalSystem} aria-hidden="true"><svg className={styles.finalLines} viewBox="0 0 700 640" fill="none">{paths.map(d => <path key={d} d={d} pathLength="1"/>)}</svg>{imageList.map((src, index) => <div key={src} ref={el => { images.current[index] = el; }} className={`${styles.finalImage} ${styles[`finalImage${index + 1}`]}`}><Image src={src} alt="" fill sizes="(max-width: 900px) 44vw, 20vw"/></div>)}<div className={styles.finalCore}><span><Layers3 size={29}/></span><strong>CubeIQ</strong><small>Connected and ready to grow</small></div><div className={styles.finalPlatforms}>{(["Meta", "Google Ads", "Instagram", "WhatsApp", "Shopify"] as PlatformName[]).map(name => <PlatformIcon key={name} name={name}/>)}</div></div>
  </div></section>;
}
export default function CubeIQPage() {
    const page = useRef<HTMLElement>(null);
    useEffect(() => {
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh, { once: true });
        return () => window.removeEventListener("load", refresh);
    }, []);
    return <main ref={page} className={styles.page}><Hero /><Problem /><GrowthSystem /><Services /><Difference /><BuiltByCubeIT /><HowWeWork /><ServicesOverview /><IdealClients /><FinalCTA /></main>;
}

