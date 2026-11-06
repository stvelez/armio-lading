"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";

const noopSubscribe = () => () => {};

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false
  );
  const [copied, setCopied] = useState(false);

  const btn =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-50";

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
    <div className="flex flex-wrap gap-2" role="group" aria-label="Compartir">
      {canShare && (
        <button type="button" onClick={share} className={btn}>
          <Share2 className="h-4 w-4" aria-hidden /> Compartir
        </button>
      )}
      <button type="button" onClick={copy} className={btn}>
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
    </div>
  );
}
