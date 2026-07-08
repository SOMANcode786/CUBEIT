"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  Clipboard,
  Code2,
  Copy,
  Gauge,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { CursorFill } from "@/components/motion/cursor-fill";
import styles from "./contact-quest.module.css";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type Option = {
  id: string;
  label: string;
  description: string;
  icon: Icon;
};

const missions: Option[] = [
  { id: "ai-product", label: "AI product", description: "Agents, document intelligence, analytics, or automation.", icon: Bot },
  { id: "enterprise-platform", label: "Business platform", description: "A connected operating system for teams and workflows.", icon: Building2 },
  { id: "saas", label: "SaaS product", description: "A scalable product with users, subscriptions, and growth.", icon: Layers3 },
  { id: "digital-experience", label: "Digital experience", description: "A premium website or product interface with real impact.", icon: Code2 },
];

const outcomes: Option[] = [
  { id: "automate", label: "Automate work", description: "Remove repetitive steps and manual handoffs.", icon: Workflow },
  { id: "unify", label: "Connect systems", description: "Bring fragmented data and teams into one flow.", icon: Layers3 },
  { id: "launch", label: "Launch faster", description: "Move from a validated idea to a working product.", icon: Rocket },
  { id: "modernize", label: "Modernize UX", description: "Make a complex product clearer, faster, and easier to use.", icon: Gauge },
  { id: "scale", label: "Prepare to scale", description: "Strengthen architecture, permissions, and product foundations.", icon: ShieldCheck },
];

const stages = ["New idea", "Existing product", "Replacing manual work", "Scaling a live system"];
const timelines = ["ASAP", "1–3 months", "3–6 months", "Exploring options"];
const budgets = ["Focused MVP", "Growth build", "Enterprise scope", "Let’s define it together"];
const stepLabels = ["Mission", "Outcome", "Scope", "Identity"];
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@cubeit.com";

type Brief = {
  mission: string;
  outcomes: string[];
  stage: string;
  timeline: string;
  budget: string;
  name: string;
  email: string;
  company: string;
  notes: string;
};

const initialBrief: Brief = {
  mission: "",
  outcomes: [],
  stage: "",
  timeline: "",
  budget: "",
  name: "",
  email: "",
  company: "",
  notes: "",
};

function optionLabel(options: Option[], id: string) {
  return options.find((option) => option.id === id)?.label ?? "Not selected";
}

export default function ContactQuest() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [brief, setBrief] = useState<Brief>(initialBrief);
  const [reward, setReward] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const score = Math.min(100,
    (brief.mission ? 20 : 0) +
    (brief.outcomes.length ? 20 : 0) +
    (brief.stage ? 15 : 0) +
    (brief.timeline ? 15 : 0) +
    (brief.budget ? 10 : 0) +
    (brief.name.trim() ? 5 : 0) +
    (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email) ? 10 : 0) +
    (brief.company.trim() ? 5 : 0),
  );

  const progress = step >= 4 ? 100 : ((step + 1) / stepLabels.length) * 100;
  const canContinue = step === 0
    ? Boolean(brief.mission)
    : step === 1
      ? brief.outcomes.length > 0
      : step === 2
        ? Boolean(brief.stage && brief.timeline && brief.budget)
        : Boolean(brief.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email));

  const summary = useMemo(() => {
    const selectedOutcomes = brief.outcomes.map((id) => optionLabel(outcomes, id)).join(", ");
    return [
      `CUBEIT PROJECT MISSION`,
      `Mission: ${optionLabel(missions, brief.mission)}`,
      `Desired outcomes: ${selectedOutcomes || "Not selected"}`,
      `Current stage: ${brief.stage || "Not selected"}`,
      `Timeline: ${brief.timeline || "Not selected"}`,
      `Scope: ${brief.budget || "Not selected"}`,
      `Contact: ${brief.name}${brief.company ? ` — ${brief.company}` : ""}`,
      `Email: ${brief.email}`,
      `Context: ${brief.notes || "No additional context yet."}`,
    ].join("\n");
  }, [brief]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`CubeIT mission — ${optionLabel(missions, brief.mission)} for ${brief.company || brief.name}`);
    return `mailto:${contactEmail}?subject=${subject}&body=${encodeURIComponent(summary)}`;
  }, [brief, summary]);

  const celebrate = (message: string) => {
    setReward(null);
    window.requestAnimationFrame(() => setReward(message));
    window.setTimeout(() => setReward(null), 1100);
  };

  const selectMission = (id: string) => {
    const isNew = !brief.mission;
    setBrief((current) => ({ ...current, mission: id }));
    celebrate(isNew ? "+20 clarity" : "Mission refined");
  };

  const toggleOutcome = (id: string) => {
    setBrief((current) => {
      const exists = current.outcomes.includes(id);
      const next = exists ? current.outcomes.filter((item) => item !== id) : [...current.outcomes, id].slice(-3);
      return { ...current, outcomes: next };
    });
    celebrate(brief.outcomes.length ? "Outcome mapped" : "+20 clarity");
  };

  const setField = (field: keyof Brief, value: string) => {
    setBrief((current) => ({ ...current, [field]: value }));
  };

  const next = () => {
    if (!canContinue) return;
    setDirection(1);
    setStep((current) => Math.min(4, current + 1));
    celebrate(step === 3 ? "Mission ready" : "Checkpoint unlocked");
  };

  const back = () => {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  const copyBrief = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const restart = () => {
    setBrief(initialBrief);
    setDirection(-1);
    setStep(0);
    setCopied(false);
  };

  return (
    <div className={styles.page}>
      <CursorFill />
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="CubeIT home">
          <span><Image src="/brand/cubeit-logo.png" alt="" width={532} height={569} priority /></span>
          <strong>CubeIT</strong>
        </Link>
        <div className={styles.headerActions}>
          <Link href="/" className={styles.homeLink}><ArrowLeft /> Back to CubeIT</Link>
          <AnimatedThemeToggler className={styles.themeToggle} variant="circle" />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <span className={styles.eyebrow}><Sparkles /> Project mission configurator</span>
          <h1>Let’s turn your next idea into a <em>clear mission.</em></h1>
          <p>Make a few focused decisions. We’ll assemble them into a useful brief you can send to CubeIT.</p>
        </section>

        <div className={styles.workspace}>
          <section className={styles.questPanel} aria-labelledby="quest-title">
            <div className={styles.progressHeader}>
              <div className={styles.progressMeta}>
                <span>{step < 4 ? `Checkpoint ${step + 1} of ${stepLabels.length}` : "Mission complete"}</span>
                <strong>{Math.round(progress)}%</strong>
              </div>
              <div className={styles.progressTrack} aria-hidden="true"><motion.span animate={{ width: `${progress}%` }} /></div>
              <ol className={styles.steps} aria-label="Project brief progress">
                {stepLabels.map((label, index) => (
                  <li key={label} data-state={index < step ? "complete" : index === step ? "current" : "pending"} aria-current={index === step ? "step" : undefined}>
                    <span>{index < step ? <Check /> : index + 1}</span><small>{label}</small>
                  </li>
                ))}
              </ol>
            </div>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 34, filter: reduceMotion ? "none" : "blur(7px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -24, filter: reduceMotion ? "none" : "blur(5px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
                className={styles.stepBody}
              >
                {step === 0 && (
                  <>
                    <div className={styles.stepTitle}><span>01 / Mission</span><h2 id="quest-title">What are we building?</h2><p>Choose the closest starting point. You can refine it with us later.</p></div>
                    <div className={styles.optionGrid}>
                      {missions.map((option) => <OptionButton key={option.id} option={option} selected={brief.mission === option.id} onClick={() => selectMission(option.id)} />)}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className={styles.stepTitle}><span>02 / Outcome</span><h2 id="quest-title">What should change?</h2><p>Select up to three outcomes. The strongest briefs are built around the result, not the feature list.</p></div>
                    <div className={styles.optionGrid}>
                      {outcomes.map((option) => <OptionButton key={option.id} option={option} selected={brief.outcomes.includes(option.id)} onClick={() => toggleOutcome(option.id)} />)}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className={styles.stepTitle}><span>03 / Scope</span><h2 id="quest-title">Calibrate the mission.</h2><p>These signals help us suggest the right product path before the first call.</p></div>
                    <ChoiceGroup label="Where are you now?" values={stages} value={brief.stage} onChange={(value) => { setField("stage", value); celebrate(brief.stage ? "Stage refined" : "+15 clarity"); }} />
                    <ChoiceGroup label="Ideal timeline" values={timelines} value={brief.timeline} onChange={(value) => { setField("timeline", value); celebrate(brief.timeline ? "Timeline refined" : "+15 clarity"); }} />
                    <ChoiceGroup label="Build ambition" values={budgets} value={brief.budget} onChange={(value) => { setField("budget", value); celebrate(brief.budget ? "Scope refined" : "+10 clarity"); }} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className={styles.stepTitle}><span>04 / Identity</span><h2 id="quest-title">Who should we build with?</h2><p>Your mission is almost ready. Add enough detail for a useful first conversation.</p></div>
                    <div className={styles.fieldGrid}>
                      <label><span>Your name *</span><input value={brief.name} onChange={(event) => setField("name", event.target.value)} autoComplete="name" required /></label>
                      <label><span>Work email *</span><input type="email" value={brief.email} onChange={(event) => setField("email", event.target.value)} autoComplete="email" required /></label>
                      <label className={styles.fieldWide}><span>Company or team</span><input value={brief.company} onChange={(event) => setField("company", event.target.value)} autoComplete="organization" /></label>
                      <label className={styles.fieldWide}><span>Useful context</span><textarea value={brief.notes} onChange={(event) => setField("notes", event.target.value)} rows={4} placeholder="What is difficult today? What would success look like?" /></label>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <div className={styles.complete}>
                    <motion.div initial={{ scale: reduceMotion ? 1 : .72, rotate: reduceMotion ? 0 : -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 15 }} className={styles.completeMark}><Check /></motion.div>
                    <span>100 clarity points unlocked</span>
                    <h2 id="quest-title">Mission assembled.</h2>
                    <p>You now have a focused brief—not just a contact form submission. Review it, copy it, or open it in your email client.</p>
                    <pre>{summary}</pre>
                    <div className={styles.completeActions}>
                      <a href={mailto} className={styles.primaryAction}>Send mission <ArrowUpRight /></a>
                      <button type="button" onClick={copyBrief}><Copy /> {copied ? "Copied" : "Copy brief"}</button>
                    </div>
                    <button type="button" onClick={restart} className={styles.restart}>Configure another mission</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 4 && (
              <div className={styles.navigation}>
                <button type="button" onClick={back} disabled={step === 0} className={styles.backButton}><ArrowLeft /> Back</button>
                <button type="button" onClick={next} disabled={!canContinue} className={styles.nextButton}>{step === 3 ? "Assemble mission" : "Continue"}<ArrowRight /></button>
              </div>
            )}
          </section>

          <aside className={styles.blueprint} aria-label="Live project brief">
            <div className={styles.scoreCard}>
              <div className={styles.scoreRing} style={{ "--score": score } as CSSProperties}>
                <motion.span key={score} initial={{ scale: reduceMotion ? 1 : .8 }} animate={{ scale: 1 }}><Image src="/brand/cubeit-logo.png" alt="" width={532} height={569} /></motion.span>
              </div>
              <div><small>Mission clarity</small><strong>{score}<em>/100</em></strong></div>
            </div>
            <div className={styles.briefCard}>
              <div className={styles.briefTitle}><Clipboard /><span>Live blueprint</span></div>
              <BriefLine label="Mission" value={optionLabel(missions, brief.mission)} ready={Boolean(brief.mission)} />
              <BriefLine label="Outcome" value={brief.outcomes.length ? brief.outcomes.map((id) => optionLabel(outcomes, id)).join(", ") : "Choose an outcome"} ready={brief.outcomes.length > 0} />
              <BriefLine label="Stage" value={brief.stage || "Calibrate scope"} ready={Boolean(brief.stage)} />
              <BriefLine label="Timeline" value={brief.timeline || "Set a pace"} ready={Boolean(brief.timeline)} />
              <BriefLine label="Team" value={brief.company || brief.name || "Introduce yourself"} ready={Boolean(brief.company || brief.name)} />
            </div>
            <div className={styles.promise}><ShieldCheck /><p><strong>No sales maze.</strong> Your answers create context for a useful first conversation.</p></div>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {reward && <motion.div className={styles.reward} initial={{ opacity: 0, y: 18, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .96 }}><Sparkles /> {reward}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function OptionButton({ option, selected, onClick }: { option: Option; selected: boolean; onClick: () => void }) {
  const Icon = option.icon;
  return (
    <button type="button" className={styles.option} data-selected={selected} aria-pressed={selected} onClick={onClick}>
      <span className={styles.optionIcon}><Icon /></span>
      <span><strong>{option.label}</strong><small>{option.description}</small></span>
      <i>{selected ? <Check /> : <ArrowUpRight />}</i>
    </button>
  );
}

function ChoiceGroup({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend>{label}</legend>
      <div>{values.map((item) => <button type="button" key={item} data-selected={value === item} aria-pressed={value === item} onClick={() => onChange(item)}>{item}{value === item && <Check />}</button>)}</div>
    </fieldset>
  );
}

function BriefLine({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return <div className={styles.briefLine} data-ready={ready}><span>{ready ? <Check /> : <span />}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}
