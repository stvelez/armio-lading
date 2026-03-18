"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

interface HotspotProps {
  x: number;
  y: number;
  title: string;
  description: string;
}

export default function Hotspot({ x, y, title, description }: HotspotProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute z-20" style={{ left: `${x}%`, top: `${y}%` }}>
      {/* Tooltip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 mb-2 w-64 max-w-xs -translate-x-1/2 rounded-xl border border-[#3C3C3A] bg-[#1A1A18] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{ zIndex: 30 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mb-1 text-sm font-semibold text-white">{title}</p>
                <p className="text-xs leading-relaxed text-[#B4B2A9]">{description}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-shrink-0 rounded p-0.5 text-[#888780] transition-colors hover:text-white"
                aria-label="Cerrar"
              >
                <X size={14} />
              </button>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3C3C3A]" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 translate-y-[-1px] border-4 border-transparent border-t-[#1A1A18]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotspot button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          isOpen
            ? "border-[#1D9E75] bg-[#1D9E75] text-white"
            : "border-[#1D9E75] bg-[#1D9E75]/20 text-[#1D9E75] hover:bg-[#1D9E75]/40"
        }`}
        aria-label={title}
      >
        <Info size={14} strokeWidth={2} />
        {/* Pulse ring */}
        {!isOpen && <span className="absolute inset-0 animate-ping rounded-full bg-[#1D9E75]/30" />}
      </motion.button>
    </div>
  );
}
