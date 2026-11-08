import { cn } from "@/lib/utils";

const PALETTES = [
  ["#2f6bff", "#0b1a4a"],
  ["#fecb00", "#3a2c00"],
  ["#e5304a", "#3d0a13"],
  ["#7c5cff", "#1c1240"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/**
 * Image du projet, ou visuel généré quand aucune capture n'est encore ajoutée.
 */
export default function ProjectCover({
  image,
  title,
  slug,
  className,
}: {
  image?: string;
  title: string;
  slug: string;
  className?: string;
}) {
  if (image) {
    return (
      <div className={cn("overflow-hidden bg-surface-2", className)}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  const [c1, c2] = PALETTES[hash(slug) % PALETTES.length];
  const short = title.split(/[—–-]/)[0].trim();
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: `radial-gradient(120% 120% at 0% 0%, ${c1}55, ${c2} 55%, #07070d)` }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.25) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Fenêtre de navigateur stylisée */}
      <div className="relative w-[78%] rounded-xl border border-white/15 bg-ink/70 shadow-2xl backdrop-blur transition-transform duration-700 group-hover:-translate-y-1">
        <div className="flex gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-td-red/80" />
          <span className="size-2 rounded-full bg-td-yellow/80" />
          <span className="size-2 rounded-full bg-td-blue/80" />
        </div>
        <div className="px-5 py-7 sm:py-10">
          <p className="font-display text-2xl font-bold sm:text-3xl" style={{ color: c1 }}>
            {short}
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-white/15" />
            <div className="h-2 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
