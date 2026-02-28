import { ButtonHTMLAttributes } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function AppButton({ variant = "primary", className = "", ...props }: AppButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${variantClass} disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
