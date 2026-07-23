"use client";

import type { CSSProperties } from "react";

type CreatorArchiveSpaceProps = {
  onClose: () => void;
};

const archiveSections = [
  {
    label: "作者简介",
    body: "金淼，以旋律构筑梦境的东方创作者。她的作品关注月光、记忆与静默之间的情绪回响。",
  },
  {
    label: "创作理念",
    body: "让音乐成为可以停留的空间，而非转瞬即逝的声音。",
  },
  {
    label: "作品方向",
    body: "以器乐叙事、氛围音乐与电影感声音景观为核心，探索东方诗意与宇宙意象的交汇。",
  },
];

export function CreatorArchiveSpace({ onClose }: CreatorArchiveSpaceProps) {
  return (
    <section className="content-cosmos content-cosmos--creator" aria-label="创作者档案">
      <div className="content-cosmos__nebula" aria-hidden="true"><i /><i /><i /></div>
      <div className="creator-stele" aria-hidden="true"><i /><i /><i /></div>
      <div className="content-cosmos__dust" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => (
          <i
            key={index}
            style={{
              "--dust-left": `${5 + index * 2.85}%`,
              "--dust-top": `${12 + (index % 7) * 10}%`,
              "--dust-size": `${1 + (index % 3) * 0.6}px`,
              "--dust-duration": `${11 + (index % 6) * 2}s`,
              "--dust-delay": `${index * -0.7}s`,
            } as CSSProperties}
          />
        ))}
      </div>
      <article className="content-cosmos__copy">
        <p className="content-cosmos__kicker">创作者档案</p>
        <h1>金淼</h1>
        <span className="content-cosmos__ornament" aria-hidden="true" />
        <div className="creator-archive-sections">
          {archiveSections.map((section) => (
            <section key={section.label}>
              <h2>{section.label}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <blockquote>月光落入沉寂的星海，<br />沉睡的旋律在遗忘之境中醒来。</blockquote>
        <cite>MIAO JIN</cite>
      </article>
      <button type="button" className="content-cosmos__return" onClick={onClose}>返回星穹圣殿<i aria-hidden="true" /></button>
      <div className="content-cosmos__vignette" aria-hidden="true" />
    </section>
  );
}
