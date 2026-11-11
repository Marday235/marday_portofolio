import { Component, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { NavLink, Route, Routes, Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Briefcase, Camera, ExternalLink, FolderKanban, Inbox, LoaderCircle, LogOut, Quote, Settings, Wrench } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import Logo from "@/components/site/Logo";
import PageLoader from "@/components/fx/PageLoader";
import { cn, errorMessage } from "@/lib/utils";
import { SessionProvider, useSession } from "./session";
import { Toggle } from "./ui";
import MessagesPage from "./MessagesPage";
import ProjectsPage from "./ProjectsPage";
import ProjectEditor from "./ProjectEditor";
import TimelinePage from "./TimelinePage";
import SkillsPage from "./SkillsPage";
import TestimonialsPage from "./TestimonialsPage";
import SettingsPage from "./SettingsPage";
import GalleryPage from "./GalleryPage";

export default function AdminApp() {
  useEffect(() => {
    document.title = "Admin — Marday 235";
  }, []);
  return (
    <SessionProvider>
      <Gate />
    </SessionProvider>
  );
}

function Gate() {
  const { token, setToken } = useSession();
  const valid = useQuery(api.auth.isValid, { token });
  if (!token || valid === false) return <Login />;
  if (valid === undefined) return <PageLoader label="Vérification de la session…" />;
  return (
    <SessionBoundary onExpired={() => setToken(null)}>
      <Shell />
    </SessionBoundary>
  );
}

/** Si une requête échoue car la session a expiré, on revient à l'écran de connexion. */
class SessionBoundary extends Component<{ children: ReactNode; onExpired: () => void }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    if (/Session expirée|Non connecté/.test(error.message)) this.props.onExpired();
  }
  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="text-lg">Une erreur est survenue.</p>
            <p className="mt-1 text-sm text-muted">{this.state.error.message}</p>
            <Button className="mt-6" onClick={() => location.reload()}>
              Recharger
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ───────────── Connexion : email + code personnel ───────────── */

function Login() {
  const { setToken } = useSession();
  const loginWithCode = useMutation(api.auth.loginWithCode);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await loginWithCode({ email, code });
      if (res.ok) setToken(res.token);
      else toast.error(res.error);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-5">
      <div className="card w-full max-w-sm overflow-hidden">
        <div className="flag-bar h-1" />
        <div className="p-7">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold">Espace admin</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Adresse email">
              <Input type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Code">
              <Input type="password" required autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <LoaderCircle className="animate-spin" />} Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Mise en page de l'admin ───────────── */

function Shell() {
  const { token, setToken } = useSession();
  const overview = useQuery(api.admin.overview, { token });
  const settings = useQuery(api.admin.getSettings, { token });
  const setAvailable = useMutation(api.admin.setAvailable);
  const logout = useMutation(api.auth.logout);

  const nav = [
    { to: "/admin", label: "Messages", icon: Inbox, end: true, badge: overview?.unread },
    { to: "/admin/projets", label: "Projets", icon: FolderKanban },
    { to: "/admin/parcours", label: "Parcours", icon: Briefcase },
    { to: "/admin/competences", label: "Compétences", icon: Wrench },
    { to: "/admin/galerie", label: "Galerie", icon: Camera },
    { to: "/admin/temoignages", label: "Témoignages", icon: Quote },
    { to: "/admin/reglages", label: "Réglages", icon: Settings },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16 lg:px-5">
          <Logo />
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Voir le site">
              <Link to="/" target="_blank">
                <ExternalLink />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Se déconnecter"
              onClick={async () => {
                await logout({ token });
                setToken(null);
              }}
            >
              <LogOut />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-white/10 text-fg" : "text-muted hover:bg-white/5 hover:text-fg",
                )
              }
            >
              <Icon className="size-4" />
              {label}
              {!!badge && <span className="ml-auto rounded-full bg-td-yellow px-1.5 text-[11px] font-bold text-ink">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        {settings && (
          <div className="hidden px-5 pt-8 lg:block">
            <div className="card p-4">
              <Toggle
                checked={settings.available}
                label="Disponible pour missions"
                onChange={(v) =>
                  setAvailable({ token, available: v }).then(() => toast.success(v ? "Badge « Disponible » affiché" : "Badge passé en « En mission »"))
                }
              />
            </div>
          </div>
        )}
      </aside>

      <main className="px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          {settings && (
            <div className="card mb-6 p-4 lg:hidden">
              <Toggle checked={settings.available} label="Disponible pour missions" onChange={(v) => setAvailable({ token, available: v })} />
            </div>
          )}
          <Routes>
            <Route index element={<MessagesPage />} />
            <Route path="projets" element={<ProjectsPage />} />
            <Route path="projets/nouveau" element={<ProjectEditor />} />
            <Route path="projets/:id" element={<ProjectEditor />} />
            <Route path="parcours" element={<TimelinePage />} />
            <Route path="competences" element={<SkillsPage />} />
            <Route path="galerie" element={<GalleryPage />} />
            <Route path="temoignages" element={<TestimonialsPage />} />
            <Route path="reglages" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
