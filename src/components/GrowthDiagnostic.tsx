"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { diagnosticQuestions } from "./cubeiq.data";
import styles from "./cubeiq.module.css";

type Answers = Record<string, string>;

function buildSummary(answers: Answers) {
  const gap = answers.gap ?? "the weakest part of the customer journey";
  const tracking = answers.tracking ?? "your current measurement setup";
  const source = answers.source ?? "your current acquisition channels";

  return `A useful first step is to review ${source.toLowerCase()}, locate the point where ${gap.toLowerCase()} is limiting growth, and confirm whether ${tracking.toLowerCase()} gives the team enough evidence to make confident decisions.`;
}

export default function GrowthDiagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const complete = step >= diagnosticQuestions.length;
  const current = diagnosticQuestions[step];
  const summary = useMemo(() => buildSummary(answers), [answers]);

  const choose = (value: string) => {
    if (!current) return;
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    window.setTimeout(() => setStep((valueStep) => valueStep + 1), 160);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const params = new URLSearchParams({
    source: "cubeiq-diagnostic",
    goal: answers.goal ?? "",
    leadSource: answers.source ?? "",
    growthGap: answers.gap ?? "",
    tracking: answers.tracking ?? "",
  });

  return (
    <div className={styles.diagnostic} aria-live="polite">
      <div className={styles.diagnosticTopline}>
        <span>Growth opportunity diagnostic</span>
        <span>{complete ? "Complete" : `${String(step + 1).padStart(2, "0")} / 04`}</span>
      </div>

      <div className={styles.diagnosticProgress} aria-hidden="true">
        <span style={{ transform: `scaleX(${complete ? 1 : step / diagnosticQuestions.length})` }} />
      </div>

      {!complete && current ? (
        <div className={styles.diagnosticQuestion} key={current.id}>
          <p className={styles.eyebrow}>A quick starting point</p>
          <h3>{current.title}</h3>
          <div className={styles.diagnosticOptions} role="group" aria-label={current.title}>
            {current.options.map((option) => (
              <button
                type="button"
                key={option}
                className={answers[current.id] === option ? styles.optionActive : undefined}
                onClick={() => choose(option)}
              >
                <span>{option}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className={styles.diagnosticControls}>
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
            >
              <ArrowLeft aria-hidden="true" /> Back
            </button>
            <span>No email required to see the summary.</span>
          </div>
        </div>
      ) : (
        <div className={styles.diagnosticResult}>
          <div className={styles.resultIcon} aria-hidden="true"><Check /></div>
          <p className={styles.eyebrow}>Your starting direction</p>
          <h3>Your next move should connect the journey before adding more activity.</h3>
          <p>{summary}</p>
          <div className={styles.diagnosticResultActions}>
            <a href={`/contact?${params.toString()}`} className={styles.primaryButton}>
              Discuss this with CubeIQ <ArrowRight aria-hidden="true" />
            </a>
            <button type="button" onClick={reset} className={styles.resetButton}>
              <RotateCcw aria-hidden="true" /> Start again
            </button>
          </div>
          <small>This is a directional summary, not a promise of guaranteed performance.</small>
        </div>
      )}
    </div>
  );
}
