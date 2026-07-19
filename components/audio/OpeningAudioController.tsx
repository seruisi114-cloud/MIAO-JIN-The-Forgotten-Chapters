"use client";

import { Howl, Howler } from "howler";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

const OPENING_AUDIO_SRC = "/audio/opening/opening-ambient.mp3";
const OPENING_VOLUME = 0.6;
const FADE_IN_DURATION = 2000;
const FADE_OUT_DURATION = 1500;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

type OpeningAudioStatus = "idle" | "loading" | "playing" | "failed";

export type OpeningAudioControllerHandle = {
  prepareOpening: () => void;
  playOpening: () => void;
  fadeOutOpening: () => Promise<void>;
  stopOpening: () => void;
};

export const OpeningAudioController = forwardRef<OpeningAudioControllerHandle>(function OpeningAudioController(_, ref) {
  const howlRef = useRef<Howl | null>(null);
  const playIdRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const fadePromiseRef = useRef<Promise<void> | null>(null);
  const fadeResolveRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<OpeningAudioStatus>("loading");

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current === null) return;
    window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const stopOpening = useCallback(() => {
    clearStopTimer();
    const howl = howlRef.current;
    const hadAudio = Boolean(howl || playIdRef.current !== null);
    setStatus("idle");

    if (howl) {
      const playId = playIdRef.current;
      if (playId !== null) howl.stop(playId);
      howl.unload();
    }
    howlRef.current = null;
    playIdRef.current = null;
    fadeResolveRef.current?.();
    fadeResolveRef.current = null;
    fadePromiseRef.current = null;
    if (IS_DEVELOPMENT && hadAudio) console.log("Opening ambient: stopped");
  }, [clearStopTimer]);

  const prepareOpening = useCallback(() => {
    if (Howler.ctx?.state === "suspended") void Howler.ctx.resume();
  }, []);

  const playOpening = useCallback(() => {
    if (IS_DEVELOPMENT) console.log("Opening ambient: trying to play");
    const howl = howlRef.current;
    if (!howl) {
      if (IS_DEVELOPMENT) console.error("Opening ambient: failed");
      return;
    }

    clearStopTimer();
    const currentId = playIdRef.current;
    if (currentId !== null && howl.playing(currentId)) return;

    try {
      prepareOpening();
      const playId = howl.play();
      playIdRef.current = playId;
      howl.fade(0, OPENING_VOLUME, FADE_IN_DURATION, playId);
    } catch (error) {
      if (IS_DEVELOPMENT) console.error("Opening ambient: failed", error);
      stopOpening();
    }
  }, [clearStopTimer, prepareOpening, stopOpening]);

  const fadeOutOpening = useCallback((): Promise<void> => {
    if (fadePromiseRef.current) return fadePromiseRef.current;
    const howl = howlRef.current;
    const playId = playIdRef.current;
    if (!howl || playId === null) return Promise.resolve();

    if (IS_DEVELOPMENT) console.log("Opening ambient: fading out");
    clearStopTimer();
    if (!howl.playing(playId)) {
      stopOpening();
      return Promise.resolve();
    }

    const currentVolume = howl.volume();
    howl.fade(currentVolume, 0, FADE_OUT_DURATION, playId);
    fadePromiseRef.current = new Promise<void>((resolve) => {
      fadeResolveRef.current = resolve;
      stopTimerRef.current = window.setTimeout(stopOpening, FADE_OUT_DURATION + 80);
    });
    return fadePromiseRef.current;
  }, [clearStopTimer, stopOpening]);

  useImperativeHandle(
    ref,
    () => ({ prepareOpening, playOpening, fadeOutOpening, stopOpening }),
    [fadeOutOpening, playOpening, prepareOpening, stopOpening],
  );

  useEffect(() => {
    const openingAudio = new Howl({
      src: [OPENING_AUDIO_SRC],
      html5: false,
      preload: true,
      autoplay: false,
      loop: true,
      volume: 0,
      onload: () => {
        setStatus("idle");
        if (IS_DEVELOPMENT) console.log("Opening ambient file: found");
      },
      onplay: () => {
        setStatus("playing");
        if (IS_DEVELOPMENT) console.log("Opening ambient: playing");
      },
      onpause: () => setStatus("idle"),
      onstop: () => setStatus("idle"),
      onloaderror: (_soundId, error) => {
        if (howlRef.current !== openingAudio) return;
        setStatus("failed");
        if (IS_DEVELOPMENT) console.error("Opening ambient file: not found", error);
        if (IS_DEVELOPMENT) console.error("Opening ambient: failed", error);
        openingAudio.unload();
        howlRef.current = null;
        playIdRef.current = null;
      },
      onplayerror: (_soundId, error) => {
        if (howlRef.current !== openingAudio) return;
        setStatus("failed");
        if (IS_DEVELOPMENT) console.error("Opening ambient: failed", error);
        openingAudio.stop();
        playIdRef.current = null;
      },
    });

    howlRef.current = openingAudio;
    return () => {
      clearStopTimer();
      fadeResolveRef.current?.();
      fadeResolveRef.current = null;
      fadePromiseRef.current = null;
      openingAudio.stop();
      openingAudio.unload();
      if (howlRef.current === openingAudio) howlRef.current = null;
      playIdRef.current = null;
    };
  }, [clearStopTimer]);

  if (!IS_DEVELOPMENT) return null;

  const statusLabel: Record<OpeningAudioStatus, string> = {
    idle: "未播放",
    loading: "加载中",
    playing: "播放中",
    failed: "播放失败",
  };

  return (
    <div className="opening-audio-devtools">
      <div className={`opening-audio-debug opening-audio-debug--${status}`} role="status" aria-live="polite">
        开场氛围音：{statusLabel[status]}
      </div>
      <button type="button" onClick={playOpening}>测试开场音乐</button>
    </div>
  );
});
