import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-td-yellow text-ink hover:bg-[#ffd83d] shadow-[0_0_0_0_rgba(254,203,0,0)] hover:shadow-[0_8px_30px_-8px_rgba(254,203,0,0.6)]",
        outline: "border border-white/15 bg-white/[0.03] text-fg hover:bg-white/[0.08] hover:border-white/25",
        ghost: "text-muted hover:text-fg hover:bg-white/[0.06]",
        whatsapp: "bg-[#25D366] text-[#062b14] hover:bg-[#3be37a]",
        danger: "bg-td-red/15 text-td-red border border-td-red/30 hover:bg-td-red/25",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
