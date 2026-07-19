"use client";

import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import { chapter01 } from "@/config/chapters";
import { ChapterAudioPlayer, ChapterAudioPlayerHandle } from "./ChapterAudioPlayer";
import { MoonlitAtmosphere } from "./MoonlitAtmosphere";
import { MoonlitSceneCanvas } from "./MoonlitSceneCanvas";
import { ReturnToSanctuary } from "./ReturnToSanctuary";

type MoonlitStarSeaWorldProps = {
  returning: boolean;
  onReturn: () => void;
  onBeforePlay: () => Promise<void>;
};

type DreamDustStyle = CSSProperties & {
  "--dream-x": string;
  "--dream-y": string;
  "--dream-delay": string;
  "--dream-drift": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function MoonlitStarSeaWorld({ returning, onReturn, onBeforePlay }: MoonlitStarSeaWorldProps) {
  const playerRef = useRef<ChapterAudioPlayerHandle>(null);
  const [playing, setPlaying] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const dust = useMemo(() => {
    const random = seededRandom(7190602);
    return Array.from({ length: 48 }, (_, id) => ({
      id,
      style: {
        "--dream-x": `${5 + random() * 90}%`,
        "--dream-y": `${8 + random() * 78}%`,
        "--dream-delay": `${-random() * 14}s`,
        "--dream-drift": `${10 + random() * 22}px`,
      } as DreamDustStyle,
    }));
  }, []);
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
      <div className="dream-dust" aria-hidden="true">
        {dust.map((particle) => <i key={particle.id} style={particle.style} />)}
      </div>
      <div className="dream-horizon" aria-hidden="true"><i /><i /><i /><b /><b /></div>
      <div className="dream-mist" aria-hidden="true"><i /><i /></div>
      <header className="dream-copy">
        <p>{chapter01.chapterLabel}</p>
        <span />
        <h1>《{chapter01.title}》</h1>
        <div className="dream-author">
          <strong>金淼</strong>
          <i aria-hidden="true" />
          <small>来自东方创作者的月光诗篇</small>
        </div>
        <blockquote>{chapter01.poem[0]}<br />{chapter01.poem[1]}</blockquote>
      </header>
      <div className="dream-controls">
        <ChapterAudioPlayer ref={playerRef} src={chapter01.audioSrc} title={chapter01.title} onBeforePlay={onBeforePlay} onPlaybackChange={handlePlaybackChange} />
        <ReturnToSanctuary onReturn={beginReturn} disabled={returning} />
      </div>
      <div className="dream-return-dust" aria-hidden="true" />
      <div className="dream-vignette" aria-hidden="true" />
    </section>
  );
}
