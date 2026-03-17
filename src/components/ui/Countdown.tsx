'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  deadline?: Date;
  spots?: number;
  spotsTaken?: number;
  showTimer?: boolean;
}

export default function Countdown({
  deadline,
  spots = 100,
  spotsTaken = 0,
  showTimer = false,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [remainingSpots, setRemainingSpots] = useState(spots - spotsTaken);

  useEffect(() => {
    if (deadline) {
      const calculateTimeLeft = () => {
        const difference = deadline.getTime() - new Date().getTime();

        if (difference > 0) {
          setTimeLeft({
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [deadline]);

  useEffect(() => {
    // Simulate spots decreasing over time for scarcity effect
    if (remainingSpots > 10) {
      const interval = setInterval(() => {
        setRemainingSpots((prev) => {
          const decrease = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
          return Math.max(10, prev - decrease);
        });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [remainingSpots]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock size={16} className="text-[#1D9E75]" />
      <span className="text-[#B4B2A9]">Solo quedan</span>
      <span className="font-semibold text-white animate-pulse">
        {remainingSpots}/{spots}
      </span>
      <span className="text-[#B4B2A9]">cupos</span>

      {showTimer && deadline && (
        <div className="ml-4 flex items-center gap-1">
          <span className="font-mono text-[#1D9E75]">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
