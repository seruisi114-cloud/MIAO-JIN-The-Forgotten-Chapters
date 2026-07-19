"use client";

import { CSSProperties, forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useAudioManager } from "@/components/audio/AudioManager";

export type ChapterAudioPlayerHandle = {
  stopAndUnload: () => void;
};

type ChapterAudioPlayerProps = {
  chapterId: string;
  title: string;
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
  { chapterId, title, onPlaybackChange },
  ref,
) {
  const { chapter, toggleChapter, seekChapter, stopChapter } = useAudioManager();
  const [hasStarted, setHasStarted] = useState(false);
  const isCurrentChapter = chapter.id === chapterId;
  const playing = isCurrentChapter && chapter.status === "playing";
  const starting = isCurrentChapter && (chapter.status === "loading" || chapter.status === "starting");
  const ready = isCurrentChapter && (chapter.status === "ready" || chapter.status === "playing" || chapter.status === "paused");
  const error = isCurrentChapter && chapter.error;
  const duration = isCurrentChapter ? chapter.duration : 0;
  const currentTime = isCurrentChapter ? chapter.currentTime : 0;

  const release = useCallback(() => {
    stopChapter(chapterId);
    onPlaybackChange(false);
  }, [chapterId, onPlaybackChange, stopChapter]);

  useImperativeHandle(ref, () => ({ stopAndUnload: release }));

  useEffect(() => {
    if (playing) setHasStarted(true);
    onPlaybackChange(playing);
  }, [onPlaybackChange, playing]);

  const togglePlayback = async () => {
    if (error || starting) return;
    if (currentTime >= duration - 0.05 && duration > 0) seekChapter(chapterId, 0);
    await toggleChapter(chapterId);
  };

  const seek = (value: number) => {
    if (!ready) return;
    seekChapter(chapterId, value);
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
