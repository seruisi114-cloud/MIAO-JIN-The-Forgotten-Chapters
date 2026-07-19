"use client";

type CreatorArchiveOverlayProps = {
  onOpen: () => void;
};

export function CreatorArchiveOverlay({ onOpen }: CreatorArchiveOverlayProps) {
  return (
    <button
      type="button"
      className="creator-archive-overlay"
      onClick={onOpen}
      aria-label="打开作者档案与作者结语"
    >
      <span className="creator-archive-kicker">作者档案</span>
      <strong>金淼</strong>
      <span className="creator-archive-catalogue">作品</span>
      <b>《月下星海》</b>
      <i className="creator-archive-divider" aria-hidden="true" />
      <span className="creator-archive-intro">来自东方创作者的一段月光叙事。</span>
      <small className="creator-archive-poem">月光落入沉寂的星海，<br />沉睡的旋律在遗忘之境中醒来。</small>
      <em>查看完整档案</em>
    </button>
  );
}
