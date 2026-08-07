"use client";

type CreatorArchiveSpaceProps = {
  onClose: () => void;
};

const archiveSections = [
  {
    label: "作者",
    body: "金淼，一位以旋律保存梦境与记忆的东方创作者。",
  },
  {
    label: "作品",
    body: "《月下星海》——一段关于月光、沉睡与回响的原创音乐。",
  },
  {
    label: "创作方向",
    body: "以器乐叙事和氛围声音构筑画面，让听者在旋律留下的空白中找到自己的故事。",
  },
];

export function CreatorArchiveSpace({ onClose }: CreatorArchiveSpaceProps) {
  return (
    <section className="manuscript-room" aria-label="创作者手稿">
      <div className="manuscript-room__moonlight" aria-hidden="true" />
      <div className="manuscript-room__desk" aria-hidden="true" />
      <div className="manuscript-room__folio" aria-hidden="true" />
      <article className="manuscript-document">
        <div className="manuscript-document__clip" aria-hidden="true" />
        <header>
          <p>创作者手稿 · 壹</p>
          <span>CREATOR&apos;S MANUSCRIPT</span>
          <h1>金淼</h1>
          <small>《月下星海》</small>
        </header>
        <div className="manuscript-document__rule" aria-hidden="true"><i /></div>
        <div className="manuscript-document__entries">
          {archiveSections.map((section) => (
            <section key={section.label}>
              <h2>{section.label}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <blockquote>月光落入沉寂的星海，<br />沉睡的旋律在遗忘之境中醒来。</blockquote>
        <footer>
          <span>现存作品记录 · 01</span>
          <cite>MIAO JIN</cite>
        </footer>
      </article>
      <button type="button" className="manuscript-room__return" onClick={onClose}>合上手稿<i aria-hidden="true" /></button>
      <div className="manuscript-room__vignette" aria-hidden="true" />
    </section>
  );
}
