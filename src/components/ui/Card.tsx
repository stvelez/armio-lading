import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      className={[
        "rounded-2xl border border-[#D3D1C7] bg-white",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:border-[#1D9E75]/40",
        "group",
        className,
      ].join(" ")}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(29,158,117,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
      }}
      {...props}
    >
      {children}
    </div>
  );
}
