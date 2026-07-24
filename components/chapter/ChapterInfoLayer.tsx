"use client";

import { useCallback, useEffect, useState } from "react";
import { chapter01 } from "@/config/chapters";

type ChapterInfoLayerProps = {
  playing: boolean;
};

export function ChapterInfoLayer({ playing }: ChapterInfoLayerProps) {
  const [visible, setVisible] = useState(true);
  const [readingCycle, setReadingCycle] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 7600);
    return () => window.clearTimeout(timer);
  }, [readingCycle]);

  const recall = useCallback(() => {
    setVisible(true);
    setReadingCycle((cycle) => cycle + 1);
  }, []);

  return (
    <>
      <header className={`dream-copy chapter-info-layer${visible ? " is-visible" : " is-muted"}${playing ? " is-playing" : ""}`}>
        <p>{chapter01.chapterLabel}</p>
        <span />
        <h1>《{chapter01.title}》</h1>
        <dl className="chapter-info-credits">
          <div><dt>作者</dt><dd>金淼</dd></div>
          <div><dt>作品</dt><dd>《月下星海》</dd></div>
        </dl>
        <blockquote>月光落入沉睡的星海，<br />旋律在寂静中寻找归途。</blockquote>
      </header>
      <p className={`chapter-lasting-caption${visible ? "" : " is-revealed"}${playing ? " is-playing" : ""}`}>
        来自东方创作者的一段月光叙事。
      </p>
      <button
        className={`chapter-info-recall${visible ? " is-open" : ""}`}
        type="button"
        onClick={recall}
        aria-label={visible ? "延长章节介绍" : "重新显示章节介绍"}
      >
        <i aria-hidden="true" />
        <span>{visible ? "篇章正在显现" : "重读篇章"}</span>
      </button>
    </>
  );
}
