import { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  contained?: boolean;
}

export default function Section({
  children,
  contained = true,
  className = "",
  ...props
}: SectionProps) {
  return (
    <section className={`px-6 py-24 ${className}`} {...props}>
      {contained ? <div className="mx-auto max-w-6xl">{children}</div> : children}
    </section>
  );
}
