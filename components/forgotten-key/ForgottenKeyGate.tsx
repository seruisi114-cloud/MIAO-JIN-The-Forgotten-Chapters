"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioManager } from "@/components/audio/AudioManager";
import { DeferredLoadingNotice } from "@/components/loading/DeferredLoadingNotice";
import type { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import type { OpeningPhase } from "@/components/opening/OpeningSequence";
import { chapter01 } from "@/config/chapters";
import { CinematicInscription } from "./CinematicInscription";
import { KeyInput } from "./KeyInput";
import { LightweightPasswordBackdrop } from "./LightweightPasswordBackdrop";

const UniverseCanvas = dynamic(() => import("@/components/universe/UniverseCanvas").then((module) => module.UniverseCanvas), {
  ssr: false,
});
const OpeningSequence = dynamic(() => import("@/components/opening/OpeningSequence").then((module) => module.OpeningSequence), {
  ssr: false,
});
const SanctuaryScene = dynamic(() => import("@/components/sanctuary/SanctuaryScene").then((module) => module.SanctuaryScene), {
  ssr: false,
});
const MoonlitStarSeaWorld = dynamic(() => import("@/components/chapter/MoonlitStarSeaWorld").then((module) => module.MoonlitStarSeaWorld), {
  ssr: false,
});
const ChapterEntryTransition = dynamic(() => import("@/components/transitions/ChapterEntryTransition").then((module) => module.ChapterEntryTransition), { ssr: false });
const SacredTransitionOverlay = dynamic(
  () => import("@/components/transitions/SacredTransitionOverlay").then((module) => module.SacredTransitionOverlay),
  { ssr: false },
);
const CreatorArchiveSpace = dynamic(() => import("@/components/creator/CreatorArchiveSpace").then((module) => module.CreatorArchiveSpace), {
  ssr: false,
});
const MusicAnalysisSpace = dynamic(() => import("@/components/analysis/MusicAnalysisSpace").then((module) => module.MusicAnalysisSpace), {
  ssr: false,
});

type SanctuaryContent = "creator-archive" | "music-analysis" | null;

export function ForgottenKeyGate() {
  const { prepareSanctuary, playSanctuary, leaveSanctuaryForChapter, playChapter, stopChapter } = useAudioManager();
  const [phase, setPhase] = useState<OpeningPhase>("locked");
  const [errorSignal, setErrorSignal] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyLength, setKeyLength] = useState(0);
  const [activeStatueId, setActiveStatueId] = useState<number | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin>({ x: 50, y: 69 });
  const [sanctuaryInstanceKey, setSanctuaryInstanceKey] = useState(0);
  const [sanctuaryContent, setSanctuaryContent] = useState<SanctuaryContent>(null);
  const [universeReady, setUniverseReady] = useState(false);
  const chapterEntryLockedRef = useRef(false);
  const transitionOriginCapturedRef = useRef(false);
  const returnTimerRef = useRef<number | null>(null);
  const chapterPreparationRef = useRef<Promise<void> | null>(null);
  const chapterSceneReadyRef = useRef<Promise<unknown> | null>(null);
  const awakened = phase !== "locked";
  const sanctuaryMounted = phase === "sanctuaryTransition" || phase === "sanctuary" || phase === "activatingStatue" || phase === "returnToSanctuary";
  const universeMounted = phase !== "locked" && phase !== "sanctuary" && phase !== "activatingStatue" && phase !== "chapterOpening" && phase !== "chapterWorld" && phase !== "returnToSanctuary";

  useEffect(
    () => () => {
      if (returnTimerRef.current) window.clearTimeout(returnTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "awakening" && phase !== "headphone" && phase !== "title" && phase !== "sanctuaryTransition" && phase !== "sanctuary") return;
    void playSanctuary();
  }, [phase, playSanctuary]);

  const beginChapterActivation = useCallback((statueId: number) => {
    if (statueId !== 1 || chapterEntryLockedRef.current) return;
    chapterEntryLockedRef.current = true;
    transitionOriginCapturedRef.current = false;
    chapterSceneReadyRef.current = import("@/components/chapter/MoonlitStarSeaWorld");
    chapterPreparationRef.current = leaveSanctuaryForChapter(chapter01.id);
    setActiveStatueId(statueId);
    setSanctuaryContent(null);
    setPhase("activatingStatue");
  }, [leaveSanctuaryForChapter]);

  const captureTransitionOrigin = useCallback((origin: TransitionOrigin) => {
    if (transitionOriginCapturedRef.current) return;
    transitionOriginCapturedRef.current = true;
    setTransitionOrigin(origin);
  }, []);

  const reachChapterPortal = useCallback(() => {
    setActiveStatueId(null);
    setPhase((current) => current === "activatingStatue" ? "chapterOpening" : current);
  }, []);
  const enterChapterWorld = useCallback(async () => {
    await Promise.all([chapterSceneReadyRef.current, chapterPreparationRef.current]);
    await playChapter(chapter01.id);
    setPhase((current) => current === "chapterOpening" ? "chapterWorld" : current);
  }, [playChapter]);
  const openCreatorArchive = useCallback(() => {
    if (phase === "sanctuary") setSanctuaryContent("creator-archive");
  }, [phase]);
  const openMusicAnalysis = useCallback(() => {
    if (phase === "sanctuary") setSanctuaryContent("music-analysis");
  }, [phase]);
  const beginReturnToSanctuary = useCallback(() => {
    if (returnTimerRef.current) return;
    stopChapter(chapter01.id);
    chapterPreparationRef.current = null;
    chapterSceneReadyRef.current = null;
    chapterEntryLockedRef.current = false;
    transitionOriginCapturedRef.current = false;
    setActiveStatueId(null);
    setSanctuaryInstanceKey((key) => key + 1);
    setPhase("returnToSanctuary");
    returnTimerRef.current = window.setTimeout(() => {
      returnTimerRef.current = null;
      setPhase("sanctuary");
    }, 2600);
  }, [stopChapter]);

  const unlock = async (key: string) => {
    // Resume the Web Audio context synchronously inside the submit gesture.
    // The server request can then safely validate the key without losing audio permission.
    prepareSanctuary();

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        setErrorSignal((signal) => signal + 1);
        return false;
      }

      void playSanctuary();
      setPhase("awakening");
      return true;
    } catch {
      setErrorSignal((signal) => signal + 1);
      return false;
    }
  };

  return (
    <div className={`forgotten-key-gate phase-${phase}${awakened ? " is-awakened" : ""}`}>
      {phase === "locked" ? <LightweightPasswordBackdrop /> : null}
      {universeMounted ? (
        <UniverseCanvas
          awakened={awakened}
          errorSignal={errorSignal}
          inputFocused={inputFocused}
          keyLength={keyLength}
          onReady={() => setUniverseReady(true)}
        />
      ) : null}
      {universeMounted && !universeReady ? <DeferredLoadingNotice /> : null}
      <CinematicInscription awakened={awakened} />
      <KeyInput awakened={awakened} onSubmit={unlock} onFocusChange={setInputFocused} onLengthChange={setKeyLength} />
      {sanctuaryMounted ? (
        <SanctuaryScene
          key={`sanctuary-${sanctuaryInstanceKey}`}
          active
          settled={phase === "sanctuary" || phase === "returnToSanctuary"}
          restoring={sanctuaryInstanceKey > 0}
          enteringChapter={phase === "activatingStatue"}
          activeStatueId={activeStatueId}
          onBeginChapterActivation={beginChapterActivation}
          onActivationPosition={captureTransitionOrigin}
          onOpenCreatorArchive={openCreatorArchive}
          onOpenMusicAnalysis={openMusicAnalysis}
        />
      ) : null}
      <OpeningSequence phase={phase} onPhaseChange={setPhase} />
      {phase === "activatingStatue" || phase === "chapterOpening" ? (
        <ChapterEntryTransition
          stage={phase === "activatingStatue" ? "approaching" : "portal"}
          origin={transitionOrigin}
          onPortalReached={reachChapterPortal}
          onComplete={enterChapterWorld}
        />
      ) : null}
      {phase === "chapterWorld" || phase === "returnToSanctuary" ? (
        <MoonlitStarSeaWorld returning={phase === "returnToSanctuary"} onReturn={beginReturnToSanctuary} />
      ) : null}
      {phase === "returnToSanctuary" ? <SacredTransitionOverlay phase="returning" origin={{ x: 50, y: 50 }} /> : null}
      {sanctuaryContent === "creator-archive" && phase === "sanctuary" ? (
        <CreatorArchiveSpace onClose={() => setSanctuaryContent(null)} />
      ) : null}
      {sanctuaryContent === "music-analysis" && phase === "sanctuary" ? (
        <MusicAnalysisSpace onClose={() => setSanctuaryContent(null)} />
      ) : null}
    </div>
  );
}
