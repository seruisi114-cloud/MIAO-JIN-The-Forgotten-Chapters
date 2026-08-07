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
        <p className="gift-letter-sheet__kicker">封存寄语</p>
        <span className="gift-letter-sheet__date">A LETTER KEPT BY MOONLIGHT</span>
        <h1>留给你的话</h1>
        <div className="gift-letter-sheet__rule" aria-hidden="true"><i /></div>
        <div className="gift-letter-sheet__body">
          <p>有些话，不适合被匆忙写下。</p>
          <p>这里暂时留着一页空白，等待你亲手写下真正想说的话。</p>
          <p>当文字准备好后，它会和《月下星海》一起，被安静地收藏在这里。</p>
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
