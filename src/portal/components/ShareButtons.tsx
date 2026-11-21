"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import Icon from "./Icon";

const noopSubscribe = () => () => {};

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false
  );
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* el usuario canceló */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", url);
    }
  }

  return (
    <div className="share-row" role="group" aria-label="Compartir">
      {canShare && (
        <button type="button" className="btn btn-secondary" onClick={share}>
          <Share2 className="od-icon" aria-hidden /> Compartir
        </button>
      )}
      <button type="button" className="btn btn-secondary" onClick={copy}>
        {copied ? (
          <Check className="od-icon" aria-hidden />
        ) : (
          <Copy className="od-icon" aria-hidden />
        )}
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
      <a
        className="btn btn-secondary"
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="chat" /> WhatsApp
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
    </div>
  );
}
