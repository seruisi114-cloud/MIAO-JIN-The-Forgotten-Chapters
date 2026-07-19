"use client";

import { useEffect, useRef } from "react";

export function ForegroundVeil() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      root.style.setProperty("--veil-x", `${currentX * 18}px`);
      root.style.setProperty("--veil-y", `${currentY * 12}px`);
      root.style.setProperty("--veil-pointer-x", `${(currentX + 0.5) * 100}%`);
      root.style.setProperty("--veil-pointer-y", `${(currentY + 0.5) * 100}%`);
      animationFrame = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    animationFrame = window.requestAnimationFrame(update);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="foreground-veil sanctuary-art-layer" aria-hidden="true">
      <i />
      <i />
      <i />
      <i className="foreground-veil-pointer" />
    </div>
  );
}
