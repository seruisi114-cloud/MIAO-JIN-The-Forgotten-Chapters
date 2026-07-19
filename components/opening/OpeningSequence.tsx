"use client";

import { useCallback, useEffect } from "react";
import { HeadphoneNotice } from "./HeadphoneNotice";
import { TitleReveal } from "./TitleReveal";
import { SanctuaryTransition } from "@/components/sanctuary/SanctuaryTransition";

export type OpeningPhase =
  | "locked"
  | "awakening"
  | "headphone"
  | "title"
  | "ready"
  | "sanctuaryTransition"
  | "sanctuary"
  | "activatingStatue"
  | "chapterOpening"
  | "chapterWorld"
  | "returnToSanctuary";

type OpeningSequenceProps = {
  phase: OpeningPhase;
  onPhaseChange: (phase: OpeningPhase) => void;
};

export function OpeningSequence({ phase, onPhaseChange }: OpeningSequenceProps) {
  const showTitle = phase === "title" || phase === "ready" || phase === "sanctuaryTransition";

  useEffect(() => {
    if (phase !== "awakening") return;
    const timer = window.setTimeout(() => onPhaseChange("headphone"), 2000);
    return () => window.clearTimeout(timer);
  }, [onPhaseChange, phase]);

  useEffect(() => {
    if (phase !== "title") return;
    const timer = window.setTimeout(() => onPhaseChange("ready"), 5000);
    return () => window.clearTimeout(timer);
  }, [onPhaseChange, phase]);

  const showTitlePhase = useCallback(() => onPhaseChange("title"), [onPhaseChange]);
  const enterSanctuary = useCallback(() => onPhaseChange("sanctuaryTransition"), [onPhaseChange]);
  const finishTransition = useCallback(() => onPhaseChange("sanctuary"), [onPhaseChange]);

  if (phase === "locked" || phase === "sanctuary" || phase === "activatingStatue" || phase === "chapterOpening" || phase === "chapterWorld" || phase === "returnToSanctuary") return null;

  return (
    <div className={`opening-sequence opening-sequence--${phase}`}>
      <div className="opening-sequence-veil" aria-hidden="true" />
      {phase === "headphone" ? <HeadphoneNotice onComplete={showTitlePhase} /> : null}
      {showTitle ? <TitleReveal settled={phase === "ready"} exiting={phase === "sanctuaryTransition"} onEnter={phase === "ready" ? enterSanctuary : undefined} /> : null}
      {phase === "sanctuaryTransition" ? <SanctuaryTransition onComplete={finishTransition} /> : null}
    </div>
  );
}
