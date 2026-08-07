"use client";

type GiftLetterSpaceProps = {
  onClose: () => void;
};

export function GiftLetterSpace({ onClose }: GiftLetterSpaceProps) {
  return (
    <section className="gift-letter-room" aria-label="封存寄语">
      <div className="gift-letter-room__moonlight" aria-hidden="true" />
      <div className="gift-letter-room__envelope" aria-hidden="true"><i /></div>
      <article className="gift-letter-sheet">
        <p className="gift-letter-sheet__kicker">给金淼的话</p>
        <span className="gift-letter-sheet__date">A LETTER KEPT BY MOONLIGHT</span>
        <h1>一封尚待写下的信</h1>
        <div className="gift-letter-sheet__rule" aria-hidden="true"><i /></div>
        <div className="gift-letter-sheet__body">
          <p>这里已经为你留下一页真正属于这份礼物的空白。</p>
          <p>等你把想对金淼说的话交给我后，正式文字会取代这里的占位内容。</p>
          <p>它将与《月下星海》一起，被安静地封存在月光里。</p>
        </div>
        <footer>
          <span>待你亲手封存</span>
          <i aria-hidden="true">月</i>
        </footer>
      </article>
      <button type="button" className="gift-letter-room__return" onClick={onClose}>合上信笺<i aria-hidden="true" /></button>
      <div className="gift-letter-room__vignette" aria-hidden="true" />
    </section>
  );
}
