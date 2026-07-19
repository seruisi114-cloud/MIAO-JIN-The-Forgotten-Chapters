"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OpeningAudioController, OpeningAudioControllerHandle } from "@/components/audio/OpeningAudioController";
import { CreatorNotePanel } from "@/components/creator/CreatorNotePanel";
import { ChapterGate } from "@/components/chapter/ChapterGate";
import { MoonlitStarSeaWorld } from "@/components/chapter/MoonlitStarSeaWorld";
import { SacredTransitionOverlay, TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { OpeningPhase, OpeningSequence } from "@/components/opening/OpeningSequence";
import { SanctuaryScene } from "@/components/sanctuary/SanctuaryScene";
import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { CinematicInscription } from "./CinematicInscription";
import { KeyInput } from "./KeyInput";

export function ForgottenKeyGate() {
  const [phase, setPhase] = useState<OpeningPhase>("locked");
  const [errorSignal, setErrorSignal] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyLength, setKeyLength] = useState(0);
  const [activeStatueId, setActiveStatueId] = useState<number | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin>({ x: 25, y: 38 });
  const [sanctuaryInstanceKey, setSanctuaryInstanceKey] = useState(0);
  const [creatorNoteOpen, setCreatorNoteOpen] = useState(false);
  const activationTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);
  const openingAudioRef = useRef<OpeningAudioControllerHandle>(null);
  const awakened = phase !== "locked";
  const sanctuaryMounted = phase === "sanctuaryTransition" || phase === "sanctuary" || phase === "activatingStatue" || phase === "returnToSanctuary";
  const universeMounted = phase !== "sanctuary" && phase !== "activatingStatue" && phase !== "chapterOpening" && phase !== "chapterWorld" && phase !== "returnToSanctuary";

  useEffect(
    () => () => {
      if (activationTimerRef.current) window.clearTimeout(activationTimerRef.current);
      if (returnTimerRef.current) window.clearTimeout(returnTimerRef.current);
    },
    [],
  );

  const beginChapterActivation = useCallback((statueId: number) => {
    if (statueId !== 1 || activationTimerRef.current) return;
    setActiveStatueId(statueId);
    setCreatorNoteOpen(false);
    setPhase("activatingStatue");
    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      setActiveStatueId(null);
      setPhase("chapterOpening");
    }, 3800);
  }, []);

  const enterChapterWorld = useCallback(() => setPhase("chapterWorld"), []);
  const prepareChapterAudio = useCallback(() => openingAudioRef.current?.fadeOutOpening() ?? Promise.resolve(), []);
  const openCreatorNote = useCallback(() => {
    if (phase === "sanctuary") setCreatorNoteOpen(true);
  }, [phase]);
  const beginReturnToSanctuary = useCallback(() => {
    if (returnTimerRef.current) return;
    setActiveStatueId(null);
    setSanctuaryInstanceKey((key) => key + 1);
    setPhase("returnToSanctuary");
    returnTimerRef.current = window.setTimeout(() => {
      returnTimerRef.current = null;
      setPhase("sanctuary");
    }, 2600);
  }, []);

  const unlock = async (key: string) => {
    // Resume the Web Audio context synchronously inside the submit gesture.
    // The server request can then safely validate the key without losing audio permission.
    openingAudioRef.current?.prepareOpening();

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

      openingAudioRef.current?.playOpening();
      setPhase("awakening");
      return true;
    } catch {
      setErrorSignal((signal) => signal + 1);
      return false;
    }
  };

  return (
    <div className={`forgotten-key-gate phase-${phase}${awakened ? " is-awakened" : ""}`}>
      <OpeningAudioController ref={openingAudioRef} />
      {universeMounted ? <UniverseCanvas awakened={awakened} errorSignal={errorSignal} inputFocused={inputFocused} keyLength={keyLength} /> : null}
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
      {phase === "chapterOpening" ? <ChapterGate onComplete={enterChapterWorld} /> : null}
      {phase === "chapterWorld" || phase === "returnToSanctuary" ? (
        <MoonlitStarSeaWorld returning={phase === "returnToSanctuary"} onReturn={beginReturnToSanctuary} onBeforePlay={prepareChapterAudio} />
      ) : null}
      {phase === "activatingStatue" || phase === "chapterOpening" ? (
        <SacredTransitionOverlay phase={phase === "activatingStatue" ? "covering" : "releasing"} origin={transitionOrigin} />
      ) : null}
      {phase === "returnToSanctuary" ? <SacredTransitionOverlay phase="returning" origin={{ x: 50, y: 50 }} /> : null}
      {creatorNoteOpen && phase === "sanctuary" ? <CreatorNotePanel onClose={() => setCreatorNoteOpen(false)} /> : null}
    </div>
  );
}
