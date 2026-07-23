"use client";

import type { CSSProperties } from "react";

type MusicAnalysisSpaceProps = {
  onClose: () => void;
};

const analysis = [
  { label: "音乐风格", body: "氛围音乐、电影感器乐与梦境叙事在同一片声场中交汇。" },
  { label: "情绪表达", body: "从沉睡般的静谧出发，沿月光与星海逐渐舒展，留下温柔、孤独与回忆的余韵。" },
  { label: "创作理念", body: "以克制的旋律和空间感保留想象，让听者在留白中形成自己的画面。" },
  { label: "听觉体验", body: "建议佩戴耳机，在较低音量下完整聆听，感受光影般的层次与缓慢呼吸。" },
];

export function MusicAnalysisSpace({ onClose }: MusicAnalysisSpaceProps) {
  return (
    <section className="content-cosmos content-cosmos--analysis" aria-label="月下星海音乐解析">
      <div className="sound-nebula" aria-hidden="true"><i /><i /><i /></div>
      <div className="sound-spectrum" aria-hidden="true">
        {Array.from({ length: 31 }, (_, index) => (
          <i
            key={index}
            style={{
              "--spectrum-height": `${12 + (index % 9) * 7}%`,
              "--spectrum-duration": `${3.8 + (index % 5) * 0.65}s`,
              "--spectrum-delay": `${index * -0.18}s`,
            } as CSSProperties}
          />
        ))}
      </div>
      <svg className="sound-flow-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 354 C146 220 264 466 444 328 S724 176 1040 328" />
        <path d="M-20 404 C164 306 318 484 506 370 S764 268 1020 382" />
        <path d="M30 276 C210 164 372 352 532 250 S812 142 970 246" />
      </svg>
      <article className="content-cosmos__copy content-cosmos__copy--analysis">
        <p className="content-cosmos__kicker">音乐解析</p>
        <h1>《月下星海》</h1>
        <span className="content-cosmos__ornament" aria-hidden="true" />
        <div className="music-analysis-sections">
          {analysis.map((item) => (
            <section key={item.label}>
              <h2>{item.label}</h2>
              <p>{item.body}</p>
            </section>
          ))}
        </div>
      </article>
      <button type="button" className="content-cosmos__return" onClick={onClose}>返回星穹圣殿<i aria-hidden="true" /></button>
      <div className="content-cosmos__vignette" aria-hidden="true" />
    </section>
  );
}
