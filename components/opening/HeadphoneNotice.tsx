"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

type HeadphoneNoticeProps = {
  onComplete: () => void;
};

export function HeadphoneNotice({ onComplete }: HeadphoneNoticeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete });

      timeline.fromTo(
        rootRef.current,
        { autoAlpha: 0, y: 8, filter: "blur(9px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: reducedMotion ? 0.25 : 1, ease: "power1.out" },
      );
      timeline.fromTo(
        ".headphone-notice-rule",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.52, duration: reducedMotion ? 0.2 : 1.2, ease: "power1.inOut" },
        "<0.1",
      );
      timeline.to({}, { duration: reducedMotion ? 1 : 2 });
      timeline.to(rootRef.current, {
        autoAlpha: 0,
        y: -7,
        filter: "blur(7px)",
        duration: reducedMotion ? 0.25 : 1,
        ease: "power1.inOut",
      });
    }, rootRef);

    return () => context.revert();
  }, [onComplete]);

  return (
    <section ref={rootRef} className="headphone-notice" aria-label="聆听提示">
      <span className="headphone-notice-mark" aria-hidden="true">
        <i />
      </span>
      <p>请佩戴耳机，静心聆听。</p>
      <span className="headphone-notice-rule" aria-hidden="true" />
      <small>篇章即将开启。</small>
    </section>
  );
}
