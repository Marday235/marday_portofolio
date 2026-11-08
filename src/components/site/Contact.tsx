import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CheckCircle2, Copy, LoaderCircle, PenLine, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { api } from "../../../convex/_generated/api";
import Socials from "./Socials";
import Turnstile, { TURNSTILE_SITE_KEY, type TurnstileHandle } from "./Turnstile";
import { useLang, type DictKey } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { cn, whatsappLink } from "@/lib/utils";

const KNOWN_ERRORS = ["invalid_name", "invalid_email", "invalid_body", "captcha", "rate_limit"];

/** Champ minimaliste : simple ligne qui s'illumine en jaune au focus. */
const line =
  "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-base text-fg placeholder:text-muted/60 transition-colors focus:border-td-yellow focus:outline-none";

export default function Contact({ settings }: { settings?: Settings }) {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const send = useAction(api.contact.send);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", body: "" });
  const [token, setToken] = useState<string | undefined>();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const captcha = useRef<TurnstileHandle>(null);
  const wa = settings ? whatsappLink(settings.whatsapp, t("waHello")) : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      await send({ ...form, lang, turnstileToken: token });
      setState("sent");
      setForm({ name: "", email: "", body: "" });
    } catch (err) {
      const code = err instanceof ConvexError ? String(err.data) : "";
      setError(t((KNOWN_ERRORS.includes(code) ? `err_${code}` : "err_generic") as DictKey));
      setState("idle");
    } finally {
      captcha.current?.reset();
    }
  }

  async function copyEmail() {
    if (!settings?.email) return;
    try {
      await navigator.clipboard.writeText(settings.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${settings.email}`;
    }
  }

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 50, filter: "blur(10px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
          viewport: { once: true },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative isolate overflow-x-clip pt-28 pb-8 sm:pt-40" aria-labelledby="contact">
      {/* Halo de couleur qui respire */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[min(820px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_90deg,#2f6bff33,#fecb0026,#e5304a33,#2f6bff33)] blur-[110px] motion-safe:animate-[spin_24s_linear_infinite]" />

      <div className="container-x flex flex-col items-center text-center">
        <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {t("replyFast")}
        </motion.span>

        <h2 id="contact" className="mt-6 font-display text-[clamp(3rem,11vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">
          <motion.span {...rise(0.1)} className="block">
            {t("contactBig1")}
          </motion.span>
          <motion.span {...rise(0.25)} className="relative isolate mt-1 inline-block px-[0.12em] italic text-ink">
            <motion.span
              className="absolute inset-x-0 bottom-[0.06em] top-[0.14em] -z-10 origin-left rounded-[0.14em] bg-td-yellow"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            {t("contactBig2")}
          </motion.span>
        </h2>

        {/* Deux actions, rien de plus */}
        <motion.div {...rise(0.4)} className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#25D366] px-7 text-base font-semibold text-[#062b14] transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,0.6)]"
            >
              <FaWhatsapp className="size-5" /> WhatsApp
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          )}
          <button
            onClick={() => {
              setShowForm((s) => !s);
              setState("idle");
            }}
            aria-expanded={showForm}
            className={cn(
              "group inline-flex h-14 items-center justify-center gap-3 rounded-full px-7 text-base font-semibold transition-all hover:scale-[1.03] cursor-pointer",
              wa ? "border border-white/15 bg-white/[0.04] text-fg hover:bg-white/[0.08]" : "bg-td-yellow text-ink",
            )}
          >
            {showForm ? <X className="size-5" /> : <PenLine className="size-5" />}
            {t("writeMessage")}
          </button>
        </motion.div>

        {/* Formulaire : seulement s'il est demandé */}
        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl overflow-hidden"
            >
              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-xl sm:p-8">
                {state === "sent" ? (
                  <div className="flex flex-col items-center py-6 text-center" role="status">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
                      <CheckCircle2 className="size-14 text-emerald-400" />
                    </motion.span>
                    <p className="mt-4 text-lg font-medium text-pretty">{t("sent")}</p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-2">
                    <div className="grid gap-x-6 sm:grid-cols-2">
                      <input aria-label={t("name")} placeholder={t("name")} required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={line} />
                      <input aria-label={t("email")} placeholder={t("email")} required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={line} />
                    </div>
                    <textarea aria-label={t("message")} placeholder={t("messagePh")} required minLength={10} maxLength={5000} rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={cn(line, "resize-none")} />
                    <Turnstile ref={captcha} onToken={setToken} lang={lang} />
                    {error && (
                      <p className="pt-2 text-sm text-td-red" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={state === "sending" || (Boolean(TURNSTILE_SITE_KEY) && !token)}
                        className="group inline-flex h-12 items-center gap-3 rounded-full bg-td-yellow pl-6 pr-2 font-semibold text-ink transition-all hover:shadow-[0_10px_30px_-8px_rgba(254,203,0,0.7)] disabled:opacity-50 cursor-pointer"
                      >
                        {state === "sending" ? t("sending") : t("send")}
                        <span className="grid size-8 place-items-center rounded-full bg-ink text-td-yellow transition-transform group-hover:translate-x-0.5">
                          {state === "sending" ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email en un clic + réseaux */}
        <motion.div {...rise(0.55)} className="mt-10 flex flex-col items-center gap-5">
          {settings?.email && (
            <button onClick={copyEmail} className="group relative inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg cursor-pointer">
              {settings.email}
              <span className="grid size-7 place-items-center rounded-full bg-white/[0.06] transition-colors group-hover:bg-white/10">
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </span>
              <span className={cn("absolute left-full ml-2 whitespace-nowrap text-xs text-emerald-400 transition-opacity", copied ? "opacity-100" : "opacity-0")}>{t("copied")}</span>
            </button>
          )}
          <Socials settings={settings} className="justify-center" />
        </motion.div>
      </div>
    </section>
  );
}
