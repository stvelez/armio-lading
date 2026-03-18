"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Maximize2 } from "lucide-react";

interface DemoVideoProps {
  isOpen: boolean;
  onClose: () => void;
  /** YouTube URL, Vimeo URL, or local MP4 path. If omitted, shows placeholder. */
  videoSrc?: string;
}

interface WindowWithGtag extends Window {
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
}

function trackGA4(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof (window as WindowWithGtag).gtag === "function") {
    (window as WindowWithGtag).gtag!("event", eventName, params);
  }
}

export default function DemoVideo({ isOpen, onClose, videoSrc }: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTrackedStart = useRef(false);

  /* ESC key to close */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  /* Auto-play on open + reset tracking flag */
  useEffect(() => {
    if (isOpen) {
      hasTrackedStart.current = false;
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const handlePlay = useCallback(() => {
    if (!hasTrackedStart.current) {
      trackGA4("video_start", { video_title: "Demo Armio" });
      hasTrackedStart.current = true;
    }
  }, []);

  const handleEnded = useCallback(() => {
    trackGA4("video_complete", { video_title: "Demo Armio" });
  }, []);

  const handleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  /* Determine if it's a YouTube/Vimeo embed or a local file */
  const isEmbed =
    videoSrc &&
    (videoSrc.includes("youtube") || videoSrc.includes("youtu.be") || videoSrc.includes("vimeo"));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Demo Armio"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-4 w-full max-w-3xl overflow-hidden rounded-2xl bg-[#111110] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            {/* Video area */}
            <div className="relative aspect-video bg-[#0A0A09]">
              {isEmbed ? (
                /* YouTube / Vimeo iframe */
                <iframe
                  src={videoSrc}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Demo Armio"
                />
              ) : videoSrc ? (
                /* Local MP4 */
                <>
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="h-full w-full object-cover"
                    controls={false}
                    playsInline
                    onPlay={handlePlay}
                    onEnded={handleEnded}
                  />
                  {/* Custom controls bar */}
                  <div className="absolute right-0 bottom-0 left-0 flex items-center gap-3 bg-gradient-to-t from-black/70 px-4 pt-8 pb-3">
                    <button
                      onClick={() => {
                        const v = videoRef.current;
                        if (!v) return;
                        if (v.paused) {
                          v.play();
                        } else {
                          v.pause();
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                      aria-label="Play/Pause"
                    >
                      <Play size={13} className="ml-0.5" />
                    </button>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-0 rounded-full bg-[#1D9E75]" />
                    </div>
                    <button
                      onClick={handleFullscreen}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                      aria-label="Pantalla completa"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </>
              ) : (
                /* Placeholder — no video yet */
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1D9E75]/20 ring-2 ring-[#1D9E75]/40">
                    <Play size={30} className="ml-1.5 text-[#1D9E75]" />
                  </div>
                  <div>
                    <p className="mb-1 text-base font-semibold text-white">
                      Demo Armio — próximamente
                    </p>
                    <p className="text-sm text-[#888780]">
                      El video estará disponible en el lanzamiento oficial
                    </p>
                  </div>
                  {/* Storyboard preview */}
                  <div className="mt-2 grid grid-cols-4 gap-2 opacity-60">
                    {[
                      { time: "0–5s", label: "Dashboard" },
                      { time: "5–10s", label: "Propiedades" },
                      { time: "10–15s", label: "Pipeline" },
                      { time: "15–30s", label: "Métricas" },
                    ].map(({ time, label }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-center"
                      >
                        <p className="text-[9px] text-[#1D9E75]">{time}</p>
                        <p className="text-[10px] text-[#B4B2A9]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <p className="text-xs text-[#888780]">
                Demo Armio · Sistema operativo para agencias inmobiliarias
              </p>
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#888780] transition-colors hover:border-white/20 hover:text-white"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
