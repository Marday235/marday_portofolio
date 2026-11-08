import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Download, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs font-semibold" role="group" aria-label="Langue">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors cursor-pointer",
            lang === l ? "bg-white/10 text-fg" : "text-muted hover:text-fg",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function cvUrl(settings: Settings | undefined, lang: "fr" | "en") {
  if (!settings) return null;
  return lang === "en" ? settings.cvEnUrl ?? settings.cvFrUrl : settings.cvFrUrl ?? settings.cvEnUrl;
}

export default function Navbar({ settings }: { settings?: Settings }) {
  const { t, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cv = cvUrl(settings, lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = [
    { href: "/#projets", label: t("navProjects") },
    { href: "/#parcours", label: t("navJourney") },
    { href: "/#competences", label: t("navSkills") },
    { href: "/#galerie", label: t("navGallery") },
    { href: "/#contact", label: t("navContact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link to={l.href} className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <LangToggle />
          {cv && (
            <Button asChild size="sm" variant="outline">
              <a href={cv} target="_blank" rel="noreferrer">
                <Download /> {t("cv")}
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LangToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label={t("menu")} aria-expanded={open}>
            {open ? <X className="!size-5" /> : <Menu className="!size-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="container-x flex flex-col gap-1 pt-6">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 font-display text-2xl font-semibold">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              {cv && (
                <li className="pt-6">
                  <Button asChild size="lg" className="w-full">
                    <a href={cv} target="_blank" rel="noreferrer">
                      <Download /> {t("cv")}
                    </a>
                  </Button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
