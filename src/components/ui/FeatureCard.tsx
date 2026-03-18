"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  preview?: string;
  delay?: number;
  className?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  preview,
  delay = 0,
  className = "",
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -8 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#3C3C3A] bg-[#232321] p-6 transition-shadow duration-300 hover:border-[#1D9E75]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(29,158,117,0.15)] ${className}`}
    >
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/10">
        <Icon size={20} className="text-[#1D9E75]" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-[#B4B2A9]">{description}</p>

      {/* Mini preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.15 }}
          className="relative mt-5 overflow-hidden rounded-lg border border-[#3C3C3A] bg-[#1A1A18]"
          style={{ height: "180px" }}
        >
          <Image
            src={preview}
            alt={title}
            fill
            className="object-cover object-top opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#232321] to-transparent" />
        </motion.div>
      )}

      {/* Hover: subtle top border glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D9E75]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
