"use client";

type ReturnToSanctuaryProps = {
  onReturn: () => void;
  disabled?: boolean;
};

export function ReturnToSanctuary({ onReturn, disabled = false }: ReturnToSanctuaryProps) {
  return (
    <button className="chapter-return" type="button" onClick={onReturn} disabled={disabled}>
      <span>返回星穹圣殿</span>
      <i aria-hidden="true" />
    </button>
  );
}
