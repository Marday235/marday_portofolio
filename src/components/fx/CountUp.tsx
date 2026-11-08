import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

/** Compteur animé qui démarre quand il devient visible. */
export default function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useMotionValue(0);
  const spring = useSpring(value, { damping: 40, stiffness: 80 });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("fr-FR");
      }),
    [spring],
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
