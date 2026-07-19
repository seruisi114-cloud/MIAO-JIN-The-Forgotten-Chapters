"use client";

type CreatorNotePanelProps = {
  onClose: () => void;
};

export function CreatorNotePanel({ onClose }: CreatorNotePanelProps) {
  return (
    <section className="creator-note-panel" aria-label="创作者结语">
      <div className="creator-note-space" aria-hidden="true">
        <i /><i /><i />
      </div>
      <article className="creator-note-copy">
        <p>创作者结语</p>
        <span aria-hidden="true" />
        <blockquote>原作者还没有发话，<br />敬请期待。</blockquote>
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
