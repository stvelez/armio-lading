import type { CSSProperties } from "react";

export type IconName =
  | "chat"
  | "search"
  | "pin"
  | "phone"
  | "mail"
  | "close"
  | "arrow"
  | "check"
  | "alert";

/**
 * Sprite de iconos del prototipo (`<symbol id="i-…">`). Se monta una sola vez en el layout del portal
 * y `Icon` lo referencia con `<use>`, igual que el prototipo.
 */
export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <symbol id="i-chat" viewBox="0 0 24 24">
        <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5Z" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </symbol>
      <symbol id="i-pin" viewBox="0 0 24 24">
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6 6 18" />
      </symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </symbol>
      <symbol id="i-alert" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.01" />
      </symbol>
    </svg>
  );
}

/** Los trazos por icono son los del prototipo: cada uso pasa su grosor y sus extremos. */
const STROKES: Record<IconName, { width: number; cap?: "round"; join?: "round" }> = {
  chat: { width: 1.8, join: "round" },
  search: { width: 2, cap: "round" },
  pin: { width: 1.8 },
  phone: { width: 1.8, join: "round" },
  mail: { width: 1.8, join: "round" },
  close: { width: 2, cap: "round" },
  arrow: { width: 2, cap: "round", join: "round" },
  check: { width: 2, cap: "round", join: "round" },
  alert: { width: 2, cap: "round" },
};

export default function Icon({
  name,
  strokeWidth,
}: {
  name: IconName;
  /** Algunos usos del prototipo cambian el grosor (p. ej. el ✕ de los chips va a 2.2). */
  strokeWidth?: number;
}) {
  const stroke = STROKES[name];
  return (
    <svg
      className="od-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? stroke.width}
      strokeLinecap={stroke.cap}
      strokeLinejoin={stroke.join}
      aria-hidden="true"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
