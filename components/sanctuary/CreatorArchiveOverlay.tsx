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
      <span className="creator-archive-intro">来自东方创作者的一段月光叙事。</span>
      <i className="creator-archive-divider" aria-hidden="true" />
      <span className="creator-archive-catalogue">已发布曲目</span>
      <b>《月下星海》</b>
      <small>原作者尚未留下更多话语，敬请期待。</small>
      <em>开启作者结语</em>
    </button>
  );
}
