import { ArrowUpRight } from "lucide-react";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Pastille de marque : fond coloré + icône contrastée. */
const BRANDS = {
  GitHub: { icon: FaGithub, bg: "#ffffff", fg: "#0d1117", glow: "rgba(255,255,255,0.35)" },
  LinkedIn: { icon: FaLinkedinIn, bg: "#0A66C2", fg: "#ffffff", glow: "rgba(10,102,194,0.55)" },
  X: { icon: FaXTwitter, bg: "#ffffff", fg: "#000000", glow: "rgba(255,255,255,0.35)" },
  Facebook: { icon: FaFacebookF, bg: "#1877F2", fg: "#ffffff", glow: "rgba(24,119,242,0.55)" },
} as const;

type Variant = "pills" | "compact";

export default function Socials({
  settings,
  className,
  variant = "pills",
}: {
  settings?: Settings;
  className?: string;
  variant?: Variant;
}) {
  if (!settings) return null;
  const items = (
    [
      ["GitHub", settings.github],
      ["LinkedIn", settings.linkedin],
      ["X", settings.x],
      ["Facebook", settings.facebook],
    ] as const
  ).filter(([, href]) => href);

  if (variant === "compact") {
    return (
      <div className={cn("flex gap-2.5", className)}>
        {items.map(([name, href]) => {
          const b = BRANDS[name];
          return (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="group relative grid size-11 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-fg/80 transition-all duration-300 hover:-translate-y-1 hover:border-transparent"
              style={{ ["--b" as string]: b.bg, ["--f" as string]: b.fg, ["--g" as string]: b.glow }}
            >
              <span className="absolute inset-0 scale-0 rounded-2xl bg-[var(--b)] transition-transform duration-300 group-hover:scale-100" />
              <b.icon className="relative size-[18px] transition-colors duration-300 group-hover:text-[var(--f)]" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_10px_30px_-6px_var(--g)] transition-opacity group-hover:opacity-100" />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map(([name, href]) => {
        const b = BRANDS[name];
        return (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-fg/85 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-fg"
            style={{ ["--g" as string]: b.glow }}
          >
            <span
              className="grid size-7 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_var(--g)]"
              style={{ background: b.bg, color: b.fg }}
            >
              <b.icon className="size-3.5" />
            </span>
            {name}
            <ArrowUpRight className="size-3.5 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-td-yellow" />
          </a>
        );
      })}
    </div>
  );
}
