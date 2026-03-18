import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, success, className = "", id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const borderClass = error
    ? "border-red-400 focus:ring-red-400"
    : success
      ? "border-[#1D9E75] focus:ring-[#1D9E75]"
      : "border-[#D3D1C7] focus:ring-[#1D9E75]";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[#2C2C2A]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "min-h-[48px] w-full rounded-xl border bg-white px-4 py-3",
          "text-[#2C2C2A] placeholder:text-[#B4B2A9]",
          "transition-all duration-150",
          "focus:ring-2 focus:ring-offset-0 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          borderClass,
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
