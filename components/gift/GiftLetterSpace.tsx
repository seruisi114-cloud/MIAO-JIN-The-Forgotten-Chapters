"use client";

import { useState } from "react";

type GiftLetterSpaceProps = {
  onClose: () => void;
};

export function GiftLetterSpace({ onClose }: GiftLetterSpaceProps) {
  const [letterState, setLetterState] = useState<"invitation" | "reading">("invitation");

  return (
    <section className={`gift-letter-room gift-letter-room--${letterState}`} aria-label="给金淼的话">
      <div className="gift-letter-room__moonlight" aria-hidden="true" />
      <div className="gift-letter-room__envelope" aria-hidden="true"><i /></div>
      {letterState === "invitation" ? (
        <article className="gift-letter-invitation" aria-live="polite">
          <p>给金淼的话</p>
          <span>A CONFESSION KEPT BY MOONLIGHT</span>
          <div className="gift-letter-invitation__seal" aria-hidden="true">月</div>
          <h1>接下来，我会向你投出一记直球。</h1>
          <blockquote>你敢不敢接？</blockquote>
          <div className="gift-letter-invitation__rule" aria-hidden="true"><i /></div>
          <div className="gift-letter-invitation__choices">
            <button type="button" onClick={() => setLetterState("reading")}>
              <strong>我想读完这封信</strong>
              <small>接住这份坦白</small>
              <i aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose}>
              <strong>封存起来，暂时不看</strong>
              <small>让它继续留在月光里</small>
              <i aria-hidden="true" />
            </button>
          </div>
        </article>
      ) : (
        <article className="gift-letter-sheet gift-letter-sheet--revealed" aria-live="polite">
          <p className="gift-letter-sheet__kicker">给金淼的话</p>
          <span className="gift-letter-sheet__date">A LETTER KEPT BY MOONLIGHT</span>
          <h1>写在月光抵达之前</h1>
          <div className="gift-letter-sheet__rule" aria-hidden="true"><i /></div>
          <div className="gift-letter-sheet__body">
            <p>感谢姐姐愿意给我这个机会，让我说出藏在心里的话。坦白讲，我并不了解你：不知道你的喜好，也不知道笑容背后藏着什么故事。</p>
            <p>可你还是悄悄走进了我的心里。安静时，我会想起你的笑，像月光落进星海，久久不散。我不敢替这份心动寻找答案，只想诚实地把它交给你。</p>
            <p>若你愿意，请给我一个明确答复。接受也好，拒绝也好，我不会怪你，也不愿让你为难；我只是想结束反复猜测，让心中的不安终于安静。无论结果如何，谢谢你听见这份喜欢。</p>
          </div>
          <footer>
            <span>无论答案如何，都愿你不必为难</span>
            <i aria-hidden="true">月</i>
          </footer>
        </article>
      )}
      {letterState === "reading" ? (
        <button type="button" className="gift-letter-room__return" onClick={onClose}>重新封存这封信<i aria-hidden="true" /></button>
      ) : null}
      <div className="gift-letter-room__vignette" aria-hidden="true" />
    </section>
  );
}
