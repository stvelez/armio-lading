"use client";

import { Clock } from "lucide-react";

interface CountdownProps {
  deadline?: Date;
  spots?: number;
  spotsTaken?: number;
  showTimer?: boolean;
  variant?: "light" | "dark";
}

export default function Countdown({
  deadline,
  spots = 100,
  spotsTaken = 0,
  showTimer = false,
  variant = "dark",
}: CountdownProps) {
  const textColor = variant === "light" ? "text-[#0F6E56]" : "text-white";
  const mutedTextColor = variant === "light" ? "text-[#0F6E56]" : "text-white";
  const timeLeft = deadline
    ? (() => {
        const difference = deadline.getTime() - new Date().getTime();

        if (difference <= 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      })()
    : { hours: 0, minutes: 0, seconds: 0 };
  const remainingSpots = Math.max(0, spots - spotsTaken);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock size={16} className={textColor} aria-hidden="true" />
      <span className={mutedTextColor}>Solo quedan</span>
      <span className={`font-semibold ${textColor}`}>
        {remainingSpots}/{spots}
      </span>
      <span className={mutedTextColor}>cupos</span>

      {showTimer && deadline && (
        <div className="ml-4 flex items-center gap-1">
          <span className="font-mono text-[#1D9E75]">
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
