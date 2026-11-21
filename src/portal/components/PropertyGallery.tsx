"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { imageProps, thumbProps } from "../lib/format";
import Icon from "./Icon";

interface Props {
  images: { url: string; thumbnail_url?: string | null }[];
  title: string;
}

/**
 * Contenido de `.detail-media` del prototipo: foto principal, controles `.icon-btn` y, además, la tira
 * de miniaturas y el visor a pantalla completa (`dialog.modal`), que el prototipo no necesita con una
 * sola foto de ejemplo.
 */
export default function PropertyGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (count ? (i + delta + count) % count : 0)),
    [count]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  }

  if (count === 0) {
    return (
      <div className="gallery-empty" style={{ "--od-ratio": "16/10" } as React.CSSProperties}>
        <ImageOff className="od-icon" aria-hidden />
        <span className="sr-only">Esta propiedad aún no tiene fotos</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="gallery-main"
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
      >
        <button
          type="button"
          className="gallery-open"
          onClick={() => setOpen(true)}
          aria-label={`Ampliar foto ${index + 1} de ${count}`}
        >
          <Image
            {...imageProps(images[index].url)}
            alt={`${title} – foto ${index + 1} de ${count}`}
            fill
            sizes="(min-width: 861px) 640px, 100vw"
            priority={index === 0}
          />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              className="icon-btn gallery-nav prev"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="od-icon" aria-hidden />
            </button>
            <button
              type="button"
              className="icon-btn gallery-nav next"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
            >
              <ChevronRight className="od-icon" aria-hidden />
            </button>
          </>
        )}
        <span className="gallery-count">
          {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <ul className="gallery-thumbs" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
              >
                <Image
                  {...(thumbProps(img) ?? imageProps(img.url))}
                  alt=""
                  fill
                  sizes="88px"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="modal gallery-modal"
        onClose={() => setOpen(false)}
        onKeyDown={onKeyDown}
        aria-label={`Galería de ${title}`}
      >
        {open && (
          <div
            className="gallery-stage"
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={onTouchEnd}
          >
            <Image
              {...imageProps(images[index].url)}
              alt={`${title} – foto ${index + 1} de ${count}`}
              fill
              sizes="100vw"
            />
            <button
              type="button"
              className="icon-btn close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar galería"
              autoFocus
            >
              <Icon name="close" />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  className="icon-btn gallery-nav prev"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="od-icon" aria-hidden />
                </button>
                <button
                  type="button"
                  className="icon-btn gallery-nav next"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="od-icon" aria-hidden />
                </button>
              </>
            )}
            <p className="gallery-count">
              {index + 1} / {count}
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
