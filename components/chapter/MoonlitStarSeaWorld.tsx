"use client";

import { useCallback, useRef, useState } from "react";
import { chapter01 } from "@/config/chapters";
import { ChapterInfoLayer } from "./ChapterInfoLayer";
import { ChapterAudioPlayer, ChapterAudioPlayerHandle } from "./ChapterAudioPlayer";
import { MoonlitAtmosphere } from "./MoonlitAtmosphere";
import { MoonlitExploration } from "./MoonlitExploration";
import { MoonlitSceneCanvas } from "./MoonlitSceneCanvas";
import { ReturnToSanctuary } from "./ReturnToSanctuary";

type MoonlitStarSeaWorldProps = {
  returning: boolean;
  onReturn: () => void;
};

export function MoonlitStarSeaWorld({ returning, onReturn }: MoonlitStarSeaWorldProps) {
  const playerRef = useRef<ChapterAudioPlayerHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const handlePlaybackChange = useCallback((active: boolean) => setPlaying(active), []);

  const beginReturn = () => {
    if (returning) return;
    playerRef.current?.stopAndUnload();
    setPlaying(false);
    onReturn();
  };

  return (
    <section className={`temporary-dream-world moonlit-star-sea-world${playing ? " is-playing" : ""}${webglReady ? " has-webgl" : ""}${returning ? " is-returning" : ""}`} aria-label={`${chapter01.chapterLabel}：${chapter01.title}`}>
      <div className="dream-sky" aria-hidden="true">
        <i className="dream-nebula dream-nebula--one" />
        <i className="dream-nebula dream-nebula--two" />
        <i className="dream-moon" />
        <i className="dream-moon-reflection" />
      </div>
      <MoonlitSceneCanvas playing={playing} onReady={() => setWebglReady(true)} />
      <MoonlitAtmosphere playing={playing} />
      <ChapterInfoLayer playing={playing} />
      <MoonlitExploration />
      <div className="dream-controls">
        <ChapterAudioPlayer ref={playerRef} chapterId={chapter01.id} title={chapter01.title} onPlaybackChange={handlePlaybackChange} />
        <ReturnToSanctuary onReturn={beginReturn} disabled={returning} />
      </div>
      <div className="dream-return-dust" aria-hidden="true" />
      <div className="dream-vignette" aria-hidden="true" />
    </section>
  );
}
