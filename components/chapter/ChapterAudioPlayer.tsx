"use client";

import { Howl } from "howler";
import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type ChapterAudioPlayerHandle = {
  stopAndUnload: () => void;
};

type ChapterAudioPlayerProps = {
  src: string;
  title: string;
  onBeforePlay: () => Promise<void>;
  onPlaybackChange: (playing: boolean) => void;
};

type ProgressStyle = CSSProperties & {
  "--chapter-progress": string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export const ChapterAudioPlayer = forwardRef<ChapterAudioPlayerHandle, ChapterAudioPlayerProps>(function ChapterAudioPlayer(
  { src, title, onBeforePlay, onPlaybackChange },
  ref,
) {
  const howlRef = useRef<Howl | null>(null);
  const animationFrameRef = useRef(0);
  const mountedRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const release = () => {
    window.cancelAnimationFrame(animationFrameRef.current);
    const howl = howlRef.current;
    if (howl) {
      howl.stop();
      howl.unload();
      howlRef.current = null;
    }
    setPlaying(false);
    setReady(false);
    setCurrentTime(0);
    onPlaybackChange(false);
  };

  useImperativeHandle(ref, () => ({ stopAndUnload: release }));

  useEffect(() => {
    const howl = new Howl({
      src: [src],
      html5: false,
      preload: true,
      autoplay: false,
      volume: 0.82,
      onload: () => {
        setDuration(howl.duration());
        setReady(true);
        setError(false);
      },
      onloaderror: () => {
        setReady(false);
        setError(true);
      },
      onplay: () => {
        setPlaying(true);
        setHasStarted(true);
        onPlaybackChange(true);
      },
      onpause: () => {
        setPlaying(false);
        onPlaybackChange(false);
      },
      onstop: () => {
        setPlaying(false);
        setCurrentTime(0);
        onPlaybackChange(false);
      },
      onend: () => {
        setPlaying(false);
        setCurrentTime(howl.duration());
        onPlaybackChange(false);
      },
    });
    howlRef.current = howl;
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      window.cancelAnimationFrame(animationFrameRef.current);
      howl.stop();
      howl.unload();
      if (howlRef.current === howl) howlRef.current = null;
    };
  }, [onPlaybackChange, src]);

  useEffect(() => {
    if (!playing) return;
    const updateProgress = () => {
      const seek = howlRef.current?.seek();
      if (typeof seek === "number") setCurrentTime(seek);
      animationFrameRef.current = window.requestAnimationFrame(updateProgress);
    };
    animationFrameRef.current = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(animationFrameRef.current);
  }, [playing]);

  const togglePlayback = async () => {
    const howl = howlRef.current;
    if (!howl || !ready || error || starting) return;
    if (howl.playing()) howl.pause();
    else {
      setStarting(true);
      await onBeforePlay();
      if (!mountedRef.current || howlRef.current !== howl) return;
      if (currentTime >= duration - 0.05) {
        howl.seek(0);
        setCurrentTime(0);
      }
      howl.play();
      setStarting(false);
    }
  };

  const seek = (value: number) => {
    const howl = howlRef.current;
    if (!howl || !ready) return;
    howl.seek(value);
    setCurrentTime(value);
  };

  const status = error ? "旋律未能回应" : !ready ? "正在聆听星海" : starting ? "正在交接旋律" : playing ? "旋律正在流动" : hasStarted ? "旋律暂歇" : "开启旋律";

  return (
    <div className={`chapter-player-placeholder chapter-audio-player${playing ? " is-playing" : ""}`} aria-label={`${title}音乐播放器`}>
      <button className="chapter-player-orbit" type="button" onClick={togglePlayback} disabled={!ready || error || starting} aria-label={playing ? "暂停旋律" : "开启旋律"}>
        <i aria-hidden="true" />
        <span aria-hidden="true">{playing ? "Ⅱ" : ""}</span>
      </button>
      <div className="chapter-player-copy">
        <small>篇章之声</small>
        <p>{status}</p>
      </div>
      <input
        className="chapter-player-progress"
        type="range"
        min="0"
        max={duration || 1}
        step="0.01"
        value={Math.min(currentTime, duration || 1)}
        onChange={(event) => seek(Number(event.target.value))}
        disabled={!ready || error}
        aria-label="播放进度"
        style={{ "--chapter-progress": `${duration > 0 ? currentTime / duration * 100 : 0}%` } as ProgressStyle}
      />
      <span className="chapter-player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
  );
});
