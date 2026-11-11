import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { HomeData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Img } from "@/components/ui/img";

type Photo = HomeData["gallery"][number];

/* Formats variés pour un rythme dynamique dans les bandes */
const SHAPES = [
  "w-[200px] h-[260px] sm:w-[260px] sm:h-[340px]",
  "w-[280px] h-[260px] sm:w-[400px] sm:h-[340px]",
  "w-[200px] h-[260px] sm:w-[240px] sm:h-[340px]",
  "w-[240px] h-[260px] sm:w-[320px] sm:h-[340px]",
];

export default function Gallery({ photos }: { photos?: Photo[] }) {
  const { t, L } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  if (!photos) {
    return (
      <section className="relative overflow-hidden pt-24 sm:pt-32" aria-hidden="true">
        <div className="container-x space-y-5">
          <div className="skeleton h-8 w-32 rounded-full" />
          <div className="skeleton h-12 w-2/3 rounded-xl sm:h-16" />
        </div>
        <div className="mt-12 flex gap-4 pl-5 sm:pl-8">
          {[0, 1, 2, 3, 0, 1].map((s, k) => (
            <div key={k} className={cn("skeleton shrink-0 rounded-[1.75rem]", SHAPES[s])} />
          ))}
        </div>
      </section>
    );
  }
  if (photos.length === 0) return null;

  // Deux bandes qui partent en sens inverse ; chaque bande est doublée pour une boucle sans couture
  const half = Math.ceil(photos.length / 2);
  const rowA = photos.map((p, i) => ({ p, i }));
  const rowB = [...photos.slice(half), ...photos.slice(0, half)].map((p) => ({ p, i: photos.indexOf(p) }));
  // Assez de photos pour remplir un grand écran
  const fill = <T,>(arr: T[]) => (arr.length >= 6 ? arr : [...arr, ...arr, ...arr]).slice(0, Math.max(arr.length, 6));

  const titleWords = t("galleryTitle").split(" ");
  const lastWord = titleWords.pop()!;

  return (
    <section className="relative pt-24 sm:pt-32" aria-labelledby="galerie">
      {/* En-tête */}
      <div className="container-x relative">
        <motion.span
          id="galerie"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-td-yellow backdrop-blur"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-td-yellow opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-td-yellow" />
          </span>
          {t("galleryEyebrow")}
        </motion.span>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-3xl text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            {titleWords.map((w, i) => (
              <motion.span
                key={i}
                className="mr-[0.25em] inline-block"
                initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="relative isolate inline-block px-[0.1em] italic text-ink"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 * titleWords.length, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="absolute inset-x-0 bottom-[0.04em] top-[0.12em] -z-10 origin-left rounded-[0.12em] bg-td-yellow"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.08 * titleWords.length + 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="relative">{lastWord}</span>
            </motion.span>
          </h2>

          <button
            onClick={() => setOpen(0)}
            className="group inline-flex items-center gap-3 self-start rounded-full bg-white/[0.06] py-2 pl-5 pr-2 text-sm font-medium transition-colors hover:bg-white/10 lg:self-auto cursor-pointer"
          >
            {t("seeAll")}
            <span className="font-display tabular-nums text-muted">{String(photos.length).padStart(2, "0")}</span>
            <span className="grid size-9 place-items-center rounded-full bg-td-yellow text-ink transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </button>
        </div>
      </div>

      {/* Bandes de photos en mouvement */}
      <div className="relative isolate mt-12 space-y-4 sm:mt-16 sm:space-y-5">
        {/* Grand texte en contour qui défile derrière */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 overflow-hidden" aria-hidden>
          <div className="marquee-track marquee-right font-display text-[22vw] font-bold leading-none tracking-tighter text-outline" style={{ ["--marquee-speed" as string]: "60s" }}>
            <span className="pr-[0.3em]">MARDAY 235 ✦ DOUALA ✦</span>
            <span className="pr-[0.3em]">MARDAY 235 ✦ DOUALA ✦</span>
          </div>
        </div>

        <Row items={fill(rowA)} direction="left" speed="55s" onOpen={setOpen} L={L} />
        <Row items={fill(rowB)} direction="right" speed="48s" onOpen={setOpen} L={L} offset={2} />
      </div>

      <AnimatePresence>
        {open !== null && <Lightbox photos={photos} start={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Row({
  items,
  direction,
  speed,
  onOpen,
  L,
  offset = 0,
}: {
  items: { p: Photo; i: number }[];
  direction: "left" | "right";
  speed: string;
  onOpen: (i: number) => void;
  L: ReturnType<typeof useLang>["L"];
  offset?: number;
}) {
  const loop = [...items, ...items];
  return (
    <div className="marquee marquee-mask overflow-hidden">
      <ul
        className={cn("marquee-track gap-4 sm:gap-5", direction === "left" ? "marquee-left" : "marquee-right")}
        style={{ ["--marquee-speed" as string]: speed }}
      >
        {loop.map(({ p, i }, k) => {
          const caption = L(p.caption);
          const dup = k >= items.length;
          return (
            <li key={k} className="shrink-0" aria-hidden={dup || undefined}>
              <button
                onClick={() => onOpen(i)}
                tabIndex={dup ? -1 : 0}
                className={cn(
                  "skeleton group relative block overflow-hidden rounded-[1.75rem] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:ring-td-yellow/60 hover:shadow-[0_30px_60px_-20px_rgba(254,203,0,0.35)] cursor-zoom-in",
                  SHAPES[(k + offset) % SHAPES.length],
                )}
              >
                <Img
                  src={p.url}
                  alt={caption || "Photo"}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 size-full object-cover duration-[1200ms] group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                <span className="absolute left-4 top-3 font-display text-2xl font-bold text-white/90 drop-shadow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {caption && (
                  <span className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-left text-xs font-medium text-white backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-1 sm:text-sm">
                    {caption}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Lightbox({ photos, start, onClose }: { photos: Photo[]; start: number; onClose: () => void }) {
  const { t, L } = useLang();
  const [[index, dir], setState] = useState<[number, number]>([start, 0]);
  const n = photos.length;
  const go = useCallback((d: number) => setState(([i]) => [(i + d + n) % n, d]), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const photo = photos[index];
  const caption = L(photo.caption);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal
      aria-label={t("galleryEyebrow")}
    >
      <div className="flex items-center justify-between p-4 text-sm text-white/70">
        <span className="font-display tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label={t("close")}>
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16">
        <div className="loader-bar absolute inset-x-0 top-0 h-[2px] overflow-hidden opacity-60" aria-hidden="true" />
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={photo._id}
            src={photo.url}
            alt={caption || "Photo"}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d >= 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ x: d >= 0 ? -120 : 120, opacity: 0, scale: 0.96 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="max-h-[72dvh] max-w-full select-none rounded-2xl object-contain shadow-2xl touch-pan-y cursor-grab active:cursor-grabbing"
            draggable={false}
          />
        </AnimatePresence>

        {n > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 hidden size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid cursor-pointer" aria-label={t("prev")}>
              <ChevronLeft />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 hidden size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid cursor-pointer" aria-label={t("next")}>
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <p className="min-h-12 px-6 pt-4 text-center text-white/90">{caption}</p>

      <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-5 pt-2">
        {photos.map((p, i) => (
          <button
            key={p._id}
            onClick={() => setState([i, i > index ? 1 : -1])}
            className={cn(
              "h-14 w-11 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
              i === index ? "border-td-yellow opacity-100" : "border-transparent opacity-40 hover:opacity-80",
            )}
            aria-label={`${i + 1}`}
          >
            <Img src={p.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
