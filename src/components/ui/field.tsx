import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-td-yellow/60 focus:bg-white/[0.05] focus:outline-none";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(base, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(base, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(base, "h-11 [&>option]:bg-surface", className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-fg/90">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}
