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
const ChapterGate = dynamic(() => import("@/components/chapter/ChapterGate").then((module) => module.ChapterGate), {
  ssr: false,
});
const SacredTransitionOverlay = dynamic(
  () => import("@/components/transitions/SacredTransitionOverlay").then((module) => module.SacredTransitionOverlay),
  { ssr: false },
);
const CreatorNotePanel = dynamic(() => import("@/components/creator/CreatorNotePanel").then((module) => module.CreatorNotePanel), {
  ssr: false,
});

export function ForgottenKeyGate() {
  const { prepareSanctuary, playSanctuary, leaveSanctuaryForChapter, playChapter, stopChapter } = useAudioManager();
  const [phase, setPhase] = useState<OpeningPhase>("locked");
  const [errorSignal, setErrorSignal] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyLength, setKeyLength] = useState(0);
  const [activeStatueId, setActiveStatueId] = useState<number | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin>({ x: 25, y: 38 });
  const [sanctuaryInstanceKey, setSanctuaryInstanceKey] = useState(0);
  const [creatorNoteOpen, setCreatorNoteOpen] = useState(false);
  const [universeReady, setUniverseReady] = useState(false);
  const activationTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);
  const chapterPreparationRef = useRef<Promise<void> | null>(null);
  const awakened = phase !== "locked";
  const sanctuaryMounted = phase === "sanctuaryTransition" || phase === "sanctuary" || phase === "activatingStatue" || phase === "returnToSanctuary";
  const universeMounted = phase !== "locked" && phase !== "sanctuary" && phase !== "activatingStatue" && phase !== "chapterOpening" && phase !== "chapterWorld" && phase !== "returnToSanctuary";

  useEffect(
    () => () => {
      if (activationTimerRef.current) window.clearTimeout(activationTimerRef.current);
      if (returnTimerRef.current) window.clearTimeout(returnTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "sanctuaryTransition" && phase !== "sanctuary") return;
    void playSanctuary();
  }, [phase, playSanctuary]);

  const beginChapterActivation = useCallback((statueId: number) => {
    if (statueId !== 1 || activationTimerRef.current) return;
    chapterPreparationRef.current = leaveSanctuaryForChapter(chapter01.id);
    setActiveStatueId(statueId);
    setCreatorNoteOpen(false);
    setPhase("activatingStatue");
    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      setActiveStatueId(null);
      setPhase("chapterOpening");
    }, 4400);
  }, [leaveSanctuaryForChapter]);

  const enterChapterWorld = useCallback(() => setPhase("chapterWorld"), []);
  const cueChapterMusic = useCallback(async () => {
    await chapterPreparationRef.current;
    await playChapter(chapter01.id);
  }, [playChapter]);
  const openCreatorNote = useCallback(() => {
    if (phase === "sanctuary") setCreatorNoteOpen(true);
  }, [phase]);
  const beginReturnToSanctuary = useCallback(() => {
    if (returnTimerRef.current) return;
    stopChapter(chapter01.id);
    chapterPreparationRef.current = null;
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
          settled={phase === "sanctuary" || phase === "activatingStatue" || phase === "returnToSanctuary"}
          restoring={sanctuaryInstanceKey > 0}
          activeStatueId={activeStatueId}
          onBeginChapterActivation={beginChapterActivation}
          onActivationPosition={setTransitionOrigin}
          onOpenCreatorNote={openCreatorNote}
        />
      ) : null}
      <OpeningSequence phase={phase} onPhaseChange={setPhase} />
      {phase === "chapterOpening" ? <ChapterGate onMusicCue={cueChapterMusic} onComplete={enterChapterWorld} /> : null}
      {phase === "chapterWorld" || phase === "returnToSanctuary" ? (
        <MoonlitStarSeaWorld returning={phase === "returnToSanctuary"} onReturn={beginReturnToSanctuary} />
      ) : null}
      {phase === "activatingStatue" || phase === "chapterOpening" ? (
        <SacredTransitionOverlay phase={phase === "activatingStatue" ? "covering" : "releasing"} origin={transitionOrigin} />
      ) : null}
      {phase === "returnToSanctuary" ? <SacredTransitionOverlay phase="returning" origin={{ x: 50, y: 50 }} /> : null}
      {creatorNoteOpen && phase === "sanctuary" ? <CreatorNotePanel onClose={() => setCreatorNoteOpen(false)} /> : null}
    </div>
  );
}
