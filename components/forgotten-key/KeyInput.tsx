"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type KeyInputProps = {
  awakened: boolean;
  onSubmit: (key: string) => Promise<boolean>;
  onFocusChange: (focused: boolean) => void;
  onLengthChange: (length: number) => void;
};

export function KeyInput({ awakened, onSubmit, onFocusChange, onLengthChange }: KeyInputProps) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value || awakened || submitting) return;

    setSubmitting(true);
    const unlocked = await onSubmit(value);
    setSubmitting(false);

    if (!unlocked) {
      setMessage("钥匙尚未回应。");
      setValue("");
      onLengthChange(0);
      if (messageTimer.current) clearTimeout(messageTimer.current);
      messageTimer.current = setTimeout(() => setMessage(""), 3200);
    }
  };

  return (
    <form
      className={`key-input${awakened ? " key-input--awakened" : ""}${message ? " key-input--error" : ""}`}
      onSubmit={submit}
      onPointerEnter={() => onFocusChange(true)}
      onPointerLeave={() => {
        if (document.activeElement !== inputRef.current) onFocusChange(false);
      }}
    >
      <label htmlFor="forgotten-key" className="key-input-label">
        输入遗忘之钥，开启门扉。
      </label>
      <div className="key-input-seal">
        <span className="key-input-ornament" aria-hidden="true" />
        <input
          ref={inputRef}
          id="forgotten-key"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          value={value}
          disabled={awakened || submitting}
          aria-describedby="key-response"
          placeholder="输入遗忘之钥"
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, "");
            setValue(nextValue);
            onLengthChange(nextValue.length);
          }}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
        />
        <div className="key-rune-count" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <i className={index < value.length ? "is-lit" : ""} key={index} />
          ))}
        </div>
      </div>
      <button type="submit" disabled={!value || awakened || submitting}>
        <span>唤醒封印</span>
      </button>
      <p id="key-response" className="key-response" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
