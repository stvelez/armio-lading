import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "info" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#1D9E75]/10 text-[#0F6E56] border-[#1D9E75]/20",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-400/10 text-amber-700 border-amber-400/30",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  outline: "bg-transparent text-[#5F5E5A] border-[#D3D1C7]",
};

export default function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
