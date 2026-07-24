"use client";

import { useEffect, useRef, useState } from "react";

const discoveries = {
  moon: "月光记录着每一次被遗忘的旋律。",
  water: "每一道星光，都是时间留下的回响。",
  melody: "声音，是记忆穿越时间的方式。",
} as const;

type DiscoveryId = keyof typeof discoveries;

export function MoonlitExploration() {
  const [active, setActive] = useState<DiscoveryId | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const reveal = (id: DiscoveryId) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setActive(id);
    timerRef.current = window.setTimeout(() => {
      setActive(null);
      timerRef.current = null;
    }, 3000);
  };

  return (
    <div className="moonlit-exploration">
      <button className="moonlit-discovery moonlit-discovery--moon" type="button" onClick={() => reveal("moon")} aria-label="聆听月亮的记忆"><i /></button>
      <button className="moonlit-discovery moonlit-discovery--water" type="button" onClick={() => reveal("water")} aria-label="触碰星海水面"><i /></button>
      <button className="moonlit-discovery moonlit-discovery--melody" type="button" onClick={() => reveal("melody")} aria-label="追随金色旋律"><i /></button>
      <div className={`moonlit-discovery-verse${active ? " is-visible" : ""}`} role="status" aria-live="polite">
        <i aria-hidden="true" />
        <p>{active ? discoveries[active] : ""}</p>
        <i aria-hidden="true" />
      </div>
    </div>
  );
}
