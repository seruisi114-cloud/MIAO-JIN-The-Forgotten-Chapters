"use client";

import { useEffect, useState } from "react";

export function DeferredLoadingNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="deferred-loading-notice" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <p>正在唤醒星穹……</p>
    </div>
  );
}
