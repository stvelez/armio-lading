"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";
import { imageProps, thumbProps } from "../lib/format";

interface Props {
  images: { url: string; thumbnail_url?: string | null }[];
  title: string;
}

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
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-stone-100 text-stone-400">
        <ImageOff className="h-10 w-10" aria-hidden />
        <span className="sr-only">Esta propiedad aún no tiene fotos</span>
      </div>
    );
  }

  const nav =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/75";

  return (
    <div>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100"
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 block h-full w-full cursor-zoom-in"
          aria-label={`Ampliar foto ${index + 1} de ${count}`}
        >
          <Image
            {...imageProps(images[index].url)}
            alt={`${title} – foto ${index + 1} de ${count}`}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
            priority={index === 0}
          />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className={`${nav} left-3`}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={`${nav} right-3`}
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden /> {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden rounded-md border-2 ${
                  i === index ? "border-portal" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  {...(thumbProps(img) ?? imageProps(img.url))}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onKeyDown={onKeyDown}
        aria-label={`Galería de ${title}`}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-black/95 p-0 text-white backdrop:bg-black"
      >
        {open && (
          <div
            className="relative flex h-full w-full items-center justify-center"
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-full w-full">
              <Image
                {...imageProps(images[index].url)}
                alt={`${title} – foto ${index + 1} de ${count}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-white/15 p-2 hover:bg-white/30"
              aria-label="Cerrar galería"
              autoFocus
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className={`${nav} left-4`}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className={`${nav} right-4`}
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              </>
            )}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm">
              {index + 1} / {count}
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
