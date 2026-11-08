import { useCallback, useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(InertiaPlugin);

type Dot = { cx: number; cy: number; xOffset: number; yOffset: number; busy: boolean; tint: number };

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

type Props = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  /** Couleurs d'activation : chaque point prend l'une d'elles (drapeau du Tchad). */
  activeColors?: string[];
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number;
};

/** Fond de points interactif (souris + clic). Statique sur mobile et si l'utilisateur réduit les animations. */
export default function DotGrid({
  dotSize = 4,
  gap = 22,
  baseColor = "#1d1b2e",
  activeColors = ["#2f6bff", "#fecb00", "#e5304a"],
  proximity = 130,
  shockRadius = 240,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointer = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, t: 0, lx: 0, ly: 0 });

  const base = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const actives = useMemo(() => activeColors.map(hexToRgb), [activeColors]);
  const interactive = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const build = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const { width, height } = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);
    const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;
    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Bandes verticales bleu / jaune / rouge, comme le drapeau
        const tint = Math.min(2, Math.floor((x / Math.max(cols, 1)) * 3));
        dots.push({ cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, busy: false, tint });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  // Boucle de dessin
  useEffect(() => {
    let raf = 0;
    const prox2 = proximity * proximity;
    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: px, y: py } = pointer.current;
      for (const d of dotsRef.current) {
        const dx = d.cx - px;
        const dy = d.cy - py;
        const dsq = dx * dx + dy * dy;
        let fill = `rgb(${base[0]},${base[1]},${base[2]})`;
        let r = dotSize / 2;
        if (dsq <= prox2) {
          const t = 1 - Math.sqrt(dsq) / proximity;
          const a = actives[d.tint % actives.length];
          fill = `rgb(${Math.round(base[0] + (a[0] - base[0]) * t)},${Math.round(base[1] + (a[1] - base[1]) * t)},${Math.round(base[2] + (a[2] - base[2]) * t)})`;
          r += t * 1.5;
        }
        ctx.beginPath();
        ctx.arc(d.cx + d.xOffset, d.cy + d.yOffset, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (interactive) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [proximity, base, actives, dotSize, interactive]);

  useEffect(() => {
    build();
    const ro = new ResizeObserver(build);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [build]);

  // Interactions (souris uniquement)
  useEffect(() => {
    if (!interactive) return;
    const push = (d: Dot, x: number, y: number) => {
      d.busy = true;
      gsap.killTweensOf(d);
      gsap.to(d, {
        inertia: { xOffset: x, yOffset: y, resistance },
        onComplete: () => {
          gsap.to(d, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: "elastic.out(1,0.75)" });
          d.busy = false;
        },
      });
    };
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 40) return;
      const p = pointer.current;
      const dt = p.t ? now - p.t : 16;
      last = now;
      let vx = ((e.clientX - p.lx) / dt) * 1000;
      let vy = ((e.clientY - p.ly) / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > 5000) {
        vx *= 5000 / speed;
        vy *= 5000 / speed;
        speed = 5000;
      }
      Object.assign(p, { t: now, lx: e.clientX, ly: e.clientY, vx, vy, speed });
      const rect = canvasRef.current!.getBoundingClientRect();
      p.x = e.clientX - rect.left;
      p.y = e.clientY - rect.top;
      if (speed < 100) return;
      for (const d of dotsRef.current) {
        if (!d.busy && Math.hypot(d.cx - p.x, d.cy - p.y) < proximity) {
          push(d, d.cx - p.x + vx * 0.005, d.cy - p.y + vy * 0.005);
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const d of dotsRef.current) {
        const dist = Math.hypot(d.cx - cx, d.cy - cy);
        if (dist < shockRadius && !d.busy) {
          const f = Math.max(0, 1 - dist / shockRadius);
          push(d, (d.cx - cx) * shockStrength * f, (d.cy - cy) * shockStrength * f);
        }
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, [interactive, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
