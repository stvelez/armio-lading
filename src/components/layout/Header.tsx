"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToWaitlist() {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header
      className={[
        "fixed top-0 right-0 left-0 z-50",
        "transition-all duration-300 ease-out",
        scrolled
          ? "border-b border-white/10 bg-[#2C2C2A]/90 shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-[12px]"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <span className="text-xl font-semibold tracking-[-0.02em] text-white select-none">
          armio
        </span>

        {/* Center: Badge */}
        <div className="hidden items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 sm:flex">
          <span className="text-sm font-semibold text-amber-300">🔥 50% OFF — Early Access</span>
        </div>

        {/* CTA */}
        <Button variant="primary" size="sm" pulse onClick={scrollToWaitlist}>
          Únete
        </Button>
      </div>

      {/* Mobile badge (below nav on small screens) */}
      <div className="flex items-center justify-center gap-2 border-t border-white/5 bg-amber-400/10 px-4 py-1.5 sm:hidden">
        <span className="text-xs font-semibold text-amber-300">🔥 50% OFF — Early Access</span>
      </div>
    </header>
  );
}
