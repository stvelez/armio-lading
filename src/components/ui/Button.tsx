"use client";

import { useRef, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  pulse?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-[44px]",
  md: "px-6 py-3 text-base min-h-[44px]",
  lg: "px-8 py-4 text-lg min-h-[44px]",
};

const variantClasses: Record<Variant, string> = {
  primary: [
    "relative overflow-hidden text-white font-semibold",
    "rounded-xl transition-all duration-200",
    "hover:scale-[1.03] active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2",
  ].join(" "),
  secondary: [
    "border-2 border-[#1D9E75] text-[#1D9E75] font-semibold",
    "rounded-xl bg-transparent transition-all duration-200",
    "hover:bg-[#0F6E56] hover:text-white hover:scale-[1.03] active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2",
  ].join(" "),
  ghost: [
    "text-[#5F5E5A] font-medium bg-transparent",
    "rounded-xl transition-all duration-200",
    "hover:bg-[#F1EFE8] hover:text-[#2C2C2A] active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2",
  ].join(" "),
};

export default function Button({
  variant = "primary",
  size = "md",
  pulse = false,
  className = "",
  children,
  onClick,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (variant === "primary" && buttonRef.current) {
      const btn = buttonRef.current;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 600ms linear;
        pointer-events: none;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }
    onClick?.(e);
  }

  return (
    <>
      <style>{`
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
        @keyframes pulse-cta {
          0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(29,158,117,0); }
        }
      `}</style>
      <button
        ref={buttonRef}
        onClick={handleClick}
        style={
          variant === "primary"
            ? {
                background: "linear-gradient(135deg, #0F6E56 0%, #0a5242 100%)",
                boxShadow: pulse ? undefined : "0 4px 16px rgba(0,0,0,0.12)",
                animation: pulse ? "pulse-cta 2s ease-in-out infinite" : undefined,
              }
            : undefined
        }
        className={`inline-flex cursor-pointer items-center justify-center disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    </>
  );
}
