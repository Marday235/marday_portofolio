import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loader: Promise<void> | null = null;
function loadScript() {
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile"));
    document.head.appendChild(s);
  });
  return loader;
}

export type TurnstileHandle = { reset: () => void };

/** Vérification anti-robot Cloudflare. Ne s'affiche que si VITE_TURNSTILE_SITE_KEY est défini. */
const Turnstile = forwardRef<TurnstileHandle, { onToken: (t: string | undefined) => void; lang: string }>(
  function Turnstile({ onToken, lang }, ref) {
    const el = useRef<HTMLDivElement>(null);
    const id = useRef<string | null>(null);
    const cb = useRef(onToken);
    cb.current = onToken;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (id.current) window.turnstile?.reset(id.current);
        cb.current(undefined);
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return;
      let cancelled = false;
      loadScript()
        .then(() => {
          if (cancelled || !el.current || !window.turnstile) return;
          id.current = window.turnstile.render(el.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "dark",
            language: lang,
            appearance: "interaction-only",
            callback: (token: string) => cb.current(token),
            "expired-callback": () => cb.current(undefined),
          });
        })
        .catch(() => cb.current(undefined));
      return () => {
        cancelled = true;
        if (id.current) window.turnstile?.remove(id.current);
        id.current = null;
      };
    }, [lang]);

    if (!TURNSTILE_SITE_KEY) return null;
    return <div ref={el} />;
  },
);

export default Turnstile;
