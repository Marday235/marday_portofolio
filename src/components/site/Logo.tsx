import { Link } from "react-router";

/** Initiales « AW » + bande aux couleurs du drapeau du Tchad, dans un carré bordé. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect
        x="1" y="1" width="62" height="62" rx="15"
        fill="var(--color-surface-2)"
        stroke="rgb(255 255 255 / 0.16)"
        strokeWidth="2"
        className="transition-[stroke] duration-300 group-hover:stroke-td-yellow"
      />
      <g fill="none" stroke="var(--color-fg)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14,38 20.5,18 27,38" />
        <line x1="16.6" y1="30" x2="24.4" y2="30" />
        <polyline points="30,18 35,38 40,24 45,38 50,18" />
      </g>
      <rect x="14" y="45" width="12" height="4" rx="2" fill="var(--color-td-blue)" />
      <rect x="26" y="45" width="12" height="4" fill="var(--color-td-yellow)" />
      <rect x="38" y="45" width="12" height="4" rx="2" fill="var(--color-td-red)" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Accueil — Marday 235">
      <LogoMark />
      <span className="font-display text-lg font-bold leading-none tracking-tight">
        Marday<span className="ml-1 text-td-blue">2</span>
        <span className="text-td-yellow">3</span>
        <span className="text-td-red">5</span>
      </span>
    </Link>
  );
}
