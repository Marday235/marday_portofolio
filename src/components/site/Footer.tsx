import Logo from "./Logo";
import Socials from "./Socials";
import { useLang } from "@/lib/i18n";
import type { Settings } from "@/lib/types";

export default function Footer({ settings }: { settings?: Settings }) {
  const { t } = useLang();
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="flag-bar h-1 w-full" />
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Abdoulaye Wardougou · Marday 235. {t("rights")}
          </p>
          <p className="text-xs text-muted/70">{t("madeIn")} 🇹🇩</p>
        </div>
        <Socials settings={settings} variant="compact" />
      </div>
    </footer>
  );
}
