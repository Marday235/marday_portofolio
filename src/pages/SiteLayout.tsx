import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { hideSplash } from "@/lib/splash";

/** Gère le défilement : vers l'ancre (#projets…) ou en haut de page. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries++ < 20) setTimeout(tick, 100); // attend que les données soient chargées
    };
    tick();
  }, [pathname, hash]);
  return null;
}

export default function SiteLayout() {
  const data = useQuery(api.public.home);

  // L'écran d'accueil part dès que les données arrivent, ou après 2,5 s
  // au plus tard : les squelettes prennent alors le relais.
  useEffect(() => {
    if (data !== undefined) hideSplash();
  }, [data]);
  useEffect(() => {
    const id = setTimeout(hideSplash, 2500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <ScrollManager />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-td-yellow focus:px-4 focus:py-2 focus:text-ink">
        Aller au contenu
      </a>
      <Navbar settings={data?.settings} />
      <main id="main">
        <Outlet />
      </main>
      <Footer settings={data?.settings} />
    </>
  );
}
