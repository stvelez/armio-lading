import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl",
        "bg-white/5 backdrop-blur-[10px]",
        "border border-white/10",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
