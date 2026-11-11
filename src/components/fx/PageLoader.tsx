import { LogoMark } from "@/components/site/Logo";

/** Chargeur plein écran (admin, pages chargées à part) dans le style de l'écran d'accueil. */
export default function PageLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="relative grid min-h-dvh place-items-center" role="status" aria-live="polite">
      <div className="loader-bar absolute inset-x-0 top-0 h-[3px] overflow-hidden" />
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-16 motion-safe:animate-[float_2.4s_ease-in-out_infinite]" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}
