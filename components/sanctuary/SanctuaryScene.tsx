"use client";

import { useCallback, useState } from "react";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { FlowingGoldenStreams } from "./FlowingGoldenStreams";
import { ForegroundVeil } from "./ForegroundVeil";
import { GoldenDustField } from "./GoldenDustField";
import { GoldenOrnaments } from "./GoldenOrnaments";
import { SacredMist } from "./SacredMist";
import { SanctuaryCanvas } from "./SanctuaryCanvas";
import { ArchiveRunesLayer } from "./ArchiveRunesLayer";

type SanctuarySceneProps = {
  active: boolean;
  settled: boolean;
  restoring: boolean;
  enteringChapter: boolean;
  activeStatueId: number | null;
  onBeginChapterActivation: (statueId: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorArchive: () => void;
  onOpenMusicAnalysis: () => void;
};

export function SanctuaryScene({ active, settled, restoring, enteringChapter, activeStatueId, onBeginChapterActivation, onActivationPosition, onOpenCreatorArchive, onOpenMusicAnalysis }: SanctuarySceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = activeStatueId ?? hoveredIndex;

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
      if (index !== 1) return;
      setHoveredIndex(1);
      onBeginChapterActivation(1);
    },
    [activeStatueId, onBeginChapterActivation],
  );

  return (
    <section className={`sanctuary-scene${active ? " sanctuary-scene--active" : ""}${settled ? " sanctuary-scene--settled" : ""}${restoring ? " sanctuary-scene--restored" : ""}${enteringChapter ? " sanctuary-scene--entering-chapter" : ""}`} aria-label="星穹圣殿">
      <SanctuaryCanvas
        restoring={restoring}
        enteringChapter={enteringChapter}
        activatingIndex={activeStatueId}
        onActiveChange={handleHoverChange}
        onActivate={handleActivate}
        onActivationPosition={onActivationPosition}
        onOpenCreatorArchive={onOpenCreatorArchive}
        onOpenMusicAnalysis={onOpenMusicAnalysis}
      />
      <SacredMist />
      <FlowingGoldenStreams activeIndex={activeIndex} />
      <ArchiveRunesLayer />
      <GoldenOrnaments activeIndex={activeIndex} />
      <GoldenDustField />
      <ForegroundVeil />
      <div className="sanctuary-vignette" aria-hidden="true" />
    </section>
  );
}
