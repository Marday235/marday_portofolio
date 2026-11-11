import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";
import "./index.css";
import { LangProvider } from "@/lib/i18n";
import SiteLayout from "@/pages/SiteLayout";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import NotFound from "@/pages/NotFound";
import PageLoader from "@/components/fx/PageLoader";
import { hideSplash } from "@/lib/splash";

// L'admin a son propre chargeur : on retire l'écran d'accueil tout de suite.
if (location.pathname.startsWith("/admin")) hideSplash();

// L'admin est chargé à part : les visiteurs ne téléchargent pas son code.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL manquant : lancez `npx convex dev` une première fois.");
}
const convex = new ConvexReactClient(convexUrl);

// Cloudflare Web Analytics (sans cookies) si le jeton est configuré
const cfToken = import.meta.env.VITE_CF_ANALYTICS_TOKEN as string | undefined;
if (cfToken && import.meta.env.PROD) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.dataset.cfBeacon = JSON.stringify({ token: cfToken });
  document.head.appendChild(s);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="projets/:slug" element={<ProjectPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route
              path="admin/*"
              element={
                <Suspense fallback={<PageLoader label="Ouverture de l'espace admin…" />}>
                  <AdminApp />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" position="bottom-center" richColors />
      </LangProvider>
    </ConvexProvider>
  </StrictMode>,
);
