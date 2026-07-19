"use client";

type CreatorNotePanelProps = {
  onClose: () => void;
};

export function CreatorNotePanel({ onClose }: CreatorNotePanelProps) {
  return (
    <section className="creator-note-panel" aria-label="作者结语">
      <div className="creator-note-space" aria-hidden="true">
        <i /><i /><i />
      </div>
      <article className="creator-note-copy">
        <p>作者结语</p>
        <span aria-hidden="true" />
        <dl className="creator-note-archive">
          <div><dt>作者</dt><dd>金淼</dd></div>
          <div><dt>曲目</dt><dd>《月下星海》</dd></div>
          <div><dt>介绍</dt><dd>来自东方创作者的一段星海梦境。</dd></div>
        </dl>
        <blockquote>
          月落之后，<br />
          仍有星辰记得那些未曾说出口的故事。
        </blockquote>
        <cite>MIAO JIN</cite>
      </article>
      <button type="button" onClick={onClose}>
        返回星穹圣殿
        <i aria-hidden="true" />
      </button>
      <div className="creator-note-vignette" aria-hidden="true" />
    </section>
  );
}
