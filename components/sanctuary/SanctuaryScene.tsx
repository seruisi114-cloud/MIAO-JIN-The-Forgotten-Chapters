"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { FlowingGoldenStreams } from "./FlowingGoldenStreams";
import { ForegroundVeil } from "./ForegroundVeil";
import { GoldenDustField } from "./GoldenDustField";
import { GoldenOrnaments } from "./GoldenOrnaments";
import { SacredMist } from "./SacredMist";
import { SanctuaryCanvas } from "./SanctuaryCanvas";

type SanctuarySceneProps = {
  active: boolean;
  settled: boolean;
  restoring: boolean;
  activeStatueId: number | null;
  onBeginChapterActivation: (statueId: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorNote: () => void;
};

export function SanctuaryScene({ active, settled, restoring, activeStatueId, onBeginChapterActivation, onActivationPosition, onOpenCreatorNote }: SanctuarySceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [unavailableMessage, setUnavailableMessage] = useState("");
  const messageTimerRef = useRef<number | null>(null);
  const activeIndex = activeStatueId ?? hoveredIndex;

  useEffect(
    () => () => {
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    },
    [],
  );

  const handleHoverChange = useCallback(
    (index: number | null) => {
      if (activeStatueId !== null) return;
      setHoveredIndex(index);
    },
    [activeStatueId],
  );

  const handleActivate = useCallback(
    (index: number) => {
      if (activeStatueId !== null) return;
      if (index === 1) {
        setHoveredIndex(1);
        onBeginChapterActivation(1);
        return;
      }

      setUnavailableMessage("此篇章尚未苏醒。");
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
      messageTimerRef.current = window.setTimeout(() => setUnavailableMessage(""), 2000);
    },
    [activeStatueId, onBeginChapterActivation],
  );

  return (
    <section className={`sanctuary-scene${active ? " sanctuary-scene--active" : ""}${settled ? " sanctuary-scene--settled" : ""}${restoring ? " sanctuary-scene--restored" : ""}`} aria-label="星穹圣殿">
      <SanctuaryCanvas
        restoring={restoring}
        activeIndex={activeIndex}
        activatingIndex={activeStatueId}
        onActiveChange={handleHoverChange}
        onActivate={handleActivate}
        onActivationPosition={onActivationPosition}
        onOpenCreatorNote={onOpenCreatorNote}
      />
      <SacredMist />
      <FlowingGoldenStreams activeIndex={activeIndex} />
      <GoldenOrnaments activeIndex={activeIndex} />
      <GoldenDustField />
      <ForegroundVeil />
      <p className={`sanctuary-unavailable${unavailableMessage ? " is-visible" : ""}`} aria-live="polite">{unavailableMessage}</p>
      <div className="sanctuary-vignette" aria-hidden="true" />
    </section>
  );
}
