"use client";

import { Howl, Howler } from "howler";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { chapterMusic } from "@/config/chapters";

const SANCTUARY_AUDIO_SRC = "/audio/opening/opening-ambient.mp3";
const SANCTUARY_VOLUME = 0.6;
const CHAPTER_VOLUME = 0.82;
const SANCTUARY_FADE_IN = 2000;
const SANCTUARY_FADE_OUT = 2500;
const CHAPTER_FADE_IN = 1600;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

type TrackStatus = "idle" | "loading" | "ready" | "starting" | "playing" | "paused" | "failed";

export type ChapterAudioSnapshot = {
  id: string | null;
  status: TrackStatus;
  duration: number;
  currentTime: number;
  error: boolean;
};

type AudioManagerValue = {
  sanctuaryStatus: TrackStatus;
  chapter: ChapterAudioSnapshot;
  prepareSanctuary: () => void;
  playSanctuary: () => Promise<void>;
  leaveSanctuaryForChapter: (chapterId: string) => Promise<void>;
  playChapter: (chapterId: string) => Promise<void>;
  toggleChapter: (chapterId: string) => Promise<void>;
  seekChapter: (chapterId: string, time: number) => void;
  stopChapter: (chapterId: string) => void;
  stopAll: () => void;
};

const EMPTY_CHAPTER: ChapterAudioSnapshot = {
  id: null,
  status: "idle",
  duration: 0,
  currentTime: 0,
  error: false,
};

const AudioManagerContext = createContext<AudioManagerValue | null>(null);

export function AudioManagerProvider({ children }: { children: ReactNode }) {
  const sanctuaryRef = useRef<Howl | null>(null);
  const sanctuaryPlayIdRef = useRef<number | null>(null);
  const sanctuaryFadePromiseRef = useRef<Promise<void> | null>(null);
  const sanctuaryFadeResolveRef = useRef<(() => void) | null>(null);
  const sanctuaryFadeTimerRef = useRef<number | null>(null);
  const chapterHowlsRef = useRef(new Map<string, Howl>());
  const chapterPlayIdsRef = useRef(new Map<string, number>());
  const chapterLoadPromisesRef = useRef(new Map<string, Promise<Howl>>());
  const activeTrackRef = useRef<string | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [sanctuaryStatus, setSanctuaryStatus] = useState<TrackStatus>("idle");
  const [chapter, setChapter] = useState<ChapterAudioSnapshot>(EMPTY_CHAPTER);

  const clearSanctuaryFade = useCallback(() => {
    if (sanctuaryFadeTimerRef.current !== null) window.clearTimeout(sanctuaryFadeTimerRef.current);
    sanctuaryFadeTimerRef.current = null;
    sanctuaryFadeResolveRef.current?.();
    sanctuaryFadeResolveRef.current = null;
    sanctuaryFadePromiseRef.current = null;
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);

  const fadeIn = useCallback((howl: Howl, playId: number, volume: number, duration: number) => {
    howl.volume(0, playId);
    howl.fade(0, volume, duration, playId);
  }, []);

  const stopSanctuary = useCallback(() => {
    clearSanctuaryFade();
    const howl = sanctuaryRef.current;
    const playId = sanctuaryPlayIdRef.current;
    if (howl) {
      if (playId !== null) howl.stop(playId);
      howl.unload();
    }
    sanctuaryRef.current = null;
    sanctuaryPlayIdRef.current = null;
    if (activeTrackRef.current === "sanctuary") activeTrackRef.current = null;
    setSanctuaryStatus("idle");
    if (IS_DEVELOPMENT) console.log("AudioManager: sanctuary stopped");
  }, [clearSanctuaryFade]);

  const fadeOutSanctuary = useCallback((duration = SANCTUARY_FADE_OUT): Promise<void> => {
    if (sanctuaryFadePromiseRef.current) return sanctuaryFadePromiseRef.current;
    const howl = sanctuaryRef.current;
    const playId = sanctuaryPlayIdRef.current;
    if (!howl || playId === null || !howl.playing(playId)) {
      stopSanctuary();
      return Promise.resolve();
    }

    if (IS_DEVELOPMENT) console.log("AudioManager: sanctuary fading out");
    const currentVolume = howl.volume(playId);
    howl.fade(typeof currentVolume === "number" ? currentVolume : SANCTUARY_VOLUME, 0, duration, playId);
    sanctuaryFadePromiseRef.current = new Promise<void>((resolve) => {
      sanctuaryFadeResolveRef.current = resolve;
      sanctuaryFadeTimerRef.current = window.setTimeout(stopSanctuary, duration + 80);
    });
    return sanctuaryFadePromiseRef.current;
  }, [stopSanctuary]);

  const createSanctuary = useCallback(() => {
    if (sanctuaryRef.current) return sanctuaryRef.current;
    setSanctuaryStatus("loading");
    const howl = new Howl({
      src: [SANCTUARY_AUDIO_SRC],
      html5: false,
      preload: false,
      autoplay: false,
      loop: true,
      volume: 0,
      onload: () => setSanctuaryStatus((status) => status === "playing" ? status : "ready"),
      onloaderror: (_id, error) => {
        setSanctuaryStatus("failed");
        if (IS_DEVELOPMENT) console.error("AudioManager: sanctuary failed", error);
      },
      onplay: () => {
        setSanctuaryStatus("playing");
        if (IS_DEVELOPMENT) console.log("AudioManager: sanctuary playing");
      },
      onstop: () => setSanctuaryStatus("idle"),
    });
    sanctuaryRef.current = howl;
    return howl;
  }, []);

  const prepareSanctuary = useCallback(() => {
    const howl = createSanctuary();
    if (howl.state() === "unloaded") howl.load();
    if (Howler.ctx?.state === "suspended") void Howler.ctx.resume();
  }, [createSanctuary]);

  const stopChapter = useCallback((chapterId: string) => {
    const howl = chapterHowlsRef.current.get(chapterId);
    if (howl) {
      const playId = chapterPlayIdsRef.current.get(chapterId);
      if (playId !== undefined) howl.stop(playId);
      howl.unload();
    }
    chapterHowlsRef.current.delete(chapterId);
    chapterPlayIdsRef.current.delete(chapterId);
    chapterLoadPromisesRef.current.delete(chapterId);
    if (activeTrackRef.current === `chapter:${chapterId}`) activeTrackRef.current = null;
    clearProgressTimer();
    setChapter((current) => current.id === chapterId ? EMPTY_CHAPTER : current);
  }, [clearProgressTimer]);

  const stopOtherChapters = useCallback((exceptId?: string) => {
    Array.from(chapterHowlsRef.current.keys()).forEach((id) => {
      if (id !== exceptId) stopChapter(id);
    });
  }, [stopChapter]);

  const loadChapter = useCallback((chapterId: string): Promise<Howl> => {
    const existing = chapterHowlsRef.current.get(chapterId);
    if (existing?.state() === "loaded") return Promise.resolve(existing);
    const pending = chapterLoadPromisesRef.current.get(chapterId);
    if (pending) return pending;

    const src = chapterMusic[chapterId];
    if (!src) {
      setChapter({ id: chapterId, status: "failed", duration: 0, currentTime: 0, error: true });
      return Promise.reject(new Error(`Unknown chapter audio: ${chapterId}`));
    }

    setChapter({ id: chapterId, status: "loading", duration: 0, currentTime: 0, error: false });
    const promise = new Promise<Howl>((resolve, reject) => {
      const howl = new Howl({
        src: [src],
        html5: false,
        preload: true,
        autoplay: false,
        loop: false,
        volume: 0,
        onload: () => {
          setChapter({ id: chapterId, status: "ready", duration: howl.duration(), currentTime: 0, error: false });
          resolve(howl);
        },
        onloaderror: (_id, error) => {
          setChapter({ id: chapterId, status: "failed", duration: 0, currentTime: 0, error: true });
          chapterHowlsRef.current.delete(chapterId);
          chapterLoadPromisesRef.current.delete(chapterId);
          reject(new Error(String(error)));
        },
        onplay: () => {
          setChapter((current) => ({ ...current, id: chapterId, status: "playing", duration: howl.duration(), error: false }));
          clearProgressTimer();
          progressTimerRef.current = window.setInterval(() => {
            const seek = howl.seek();
            if (typeof seek === "number") setChapter((current) => current.id === chapterId ? { ...current, currentTime: seek } : current);
          }, 180);
        },
        onpause: () => {
          clearProgressTimer();
          setChapter((current) => current.id === chapterId ? { ...current, status: "paused" } : current);
        },
        onstop: () => {
          clearProgressTimer();
          setChapter((current) => current.id === chapterId ? { ...current, status: "ready", currentTime: 0 } : current);
        },
        onend: () => {
          clearProgressTimer();
          setChapter((current) => current.id === chapterId ? { ...current, status: "ready", currentTime: howl.duration() } : current);
          if (activeTrackRef.current === `chapter:${chapterId}`) activeTrackRef.current = null;
        },
      });
      chapterHowlsRef.current.set(chapterId, howl);
    });
    chapterLoadPromisesRef.current.set(chapterId, promise);
    void promise.then(
      () => chapterLoadPromisesRef.current.delete(chapterId),
      () => chapterLoadPromisesRef.current.delete(chapterId),
    );
    return promise;
  }, [clearProgressTimer]);

  const playSanctuary = useCallback(async () => {
    if (activeTrackRef.current === "sanctuary" && sanctuaryPlayIdRef.current !== null) return;
    stopOtherChapters();
    prepareSanctuary();
    const howl = createSanctuary();
    const playId = howl.play();
    sanctuaryPlayIdRef.current = playId;
    activeTrackRef.current = "sanctuary";
    fadeIn(howl, playId, SANCTUARY_VOLUME, SANCTUARY_FADE_IN);
  }, [createSanctuary, fadeIn, prepareSanctuary, stopOtherChapters]);

  const leaveSanctuaryForChapter = useCallback(async (chapterId: string) => {
    await fadeOutSanctuary(SANCTUARY_FADE_OUT);
    stopOtherChapters(chapterId);
    try {
      await loadChapter(chapterId);
    } catch (error) {
      if (IS_DEVELOPMENT) console.error("AudioManager: chapter failed to load", error);
    }
  }, [fadeOutSanctuary, loadChapter, stopOtherChapters]);

  const playChapter = useCallback(async (chapterId: string) => {
    await fadeOutSanctuary(SANCTUARY_FADE_OUT);
    stopOtherChapters(chapterId);
    let howl: Howl;
    try {
      howl = await loadChapter(chapterId);
    } catch {
      return;
    }
    const existingId = chapterPlayIdsRef.current.get(chapterId);
    if (existingId !== undefined && howl.playing(existingId)) return;
    setChapter((current) => ({ ...current, id: chapterId, status: "starting", error: false }));
    const playId = existingId !== undefined ? howl.play(existingId) : howl.play();
    chapterPlayIdsRef.current.set(chapterId, playId);
    activeTrackRef.current = `chapter:${chapterId}`;
    fadeIn(howl, playId, CHAPTER_VOLUME, CHAPTER_FADE_IN);
  }, [fadeIn, fadeOutSanctuary, loadChapter, stopOtherChapters]);

  const toggleChapter = useCallback(async (chapterId: string) => {
    const howl = chapterHowlsRef.current.get(chapterId);
    const playId = chapterPlayIdsRef.current.get(chapterId);
    if (howl && playId !== undefined && howl.playing(playId)) {
      howl.pause(playId);
      return;
    }
    await playChapter(chapterId);
  }, [playChapter]);

  const seekChapter = useCallback((chapterId: string, time: number) => {
    const howl = chapterHowlsRef.current.get(chapterId);
    const playId = chapterPlayIdsRef.current.get(chapterId);
    if (!howl) return;
    if (playId !== undefined) howl.seek(time, playId);
    else howl.seek(time);
    setChapter((current) => current.id === chapterId ? { ...current, currentTime: time } : current);
  }, []);

  const stopAll = useCallback(() => {
    stopSanctuary();
    Array.from(chapterHowlsRef.current.keys()).forEach(stopChapter);
    activeTrackRef.current = null;
  }, [stopChapter, stopSanctuary]);

  useEffect(() => stopAll, [stopAll]);

  const value = useMemo<AudioManagerValue>(() => ({
    sanctuaryStatus,
    chapter,
    prepareSanctuary,
    playSanctuary,
    leaveSanctuaryForChapter,
    playChapter,
    toggleChapter,
    seekChapter,
    stopChapter,
    stopAll,
  }), [chapter, leaveSanctuaryForChapter, playChapter, playSanctuary, prepareSanctuary, sanctuaryStatus, seekChapter, stopAll, stopChapter, toggleChapter]);

  return (
    <AudioManagerContext.Provider value={value}>
      {children}
      {IS_DEVELOPMENT ? (
        <div className="opening-audio-devtools">
          <div className={`opening-audio-debug opening-audio-debug--${sanctuaryStatus}`} role="status" aria-live="polite">
            大厅氛围音：{sanctuaryStatus === "playing" ? "播放中" : sanctuaryStatus === "loading" ? "加载中" : sanctuaryStatus === "failed" ? "播放失败" : "未播放"}
          </div>
          <button type="button" onClick={() => void playSanctuary()}>测试大厅音乐</button>
        </div>
      ) : null}
    </AudioManagerContext.Provider>
  );
}

export function useAudioManager() {
  const context = useContext(AudioManagerContext);
  if (!context) throw new Error("useAudioManager must be used within AudioManagerProvider");
  return context;
}
