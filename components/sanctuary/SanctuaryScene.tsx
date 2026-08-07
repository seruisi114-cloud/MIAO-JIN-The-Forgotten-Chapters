"use client";

import { useCallback } from "react";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { ForegroundVeil } from "./ForegroundVeil";
import { SacredMist } from "./SacredMist";
import { SanctuaryCanvas } from "./SanctuaryCanvas";

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

export function SanctuaryScene(props: SanctuarySceneProps) {
  const { active, settled, restoring, enteringChapter, activeStatueId, onBeginChapterActivation, onActivationPosition, onOpenCreatorArchive } = props;
  const handleHoverChange = useCallback(() => undefined, []);

  const handleActivate = useCallback(
    (index: number) => {
      if (activeStatueId !== null) return;
      if (index !== 1) return;
      onBeginChapterActivation(1);
    },
    [activeStatueId, onBeginChapterActivation],
  );

  return (
    <section className={`sanctuary-scene${active ? " sanctuary-scene--active" : ""}${settled ? " sanctuary-scene--settled" : ""}${restoring ? " sanctuary-scene--restored" : ""}${enteringChapter ? " sanctuary-scene--entering-chapter" : ""}`} aria-label="月下藏音馆">
      <SanctuaryCanvas
        restoring={restoring}
        enteringChapter={enteringChapter}
        activatingIndex={activeStatueId}
        onActiveChange={handleHoverChange}
        onActivate={handleActivate}
        onActivationPosition={onActivationPosition}
        onOpenCreatorArchive={onOpenCreatorArchive}
      />
      <SacredMist />
      <ForegroundVeil />
      <div className="sanctuary-vignette" aria-hidden="true" />
    </section>
  );
}
