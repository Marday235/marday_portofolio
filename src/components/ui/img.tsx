import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Image qui apparaît en fondu une fois chargée.
 * Le parent porte la classe `skeleton` : l'effet de brillance reste visible
 * tant que l'image n'est pas arrivée (utile en connexion lente).
 */
export function Img({ className, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Image déjà en cache : l'événement load a pu partir avant React
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [props.src]);

  return (
    <img
      ref={ref}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn(
        "transition-[opacity,filter,transform] duration-700 ease-out",
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
        className,
      )}
    />
  );
}
