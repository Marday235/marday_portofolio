import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { api } from "../../convex/_generated/api";
import Reveal from "@/components/fx/Reveal";
import ProjectCover from "@/components/site/ProjectCover";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";
import { useLang } from "@/lib/i18n";

export default function ProjectPage() {
  const { slug = "" } = useParams();
  const data = useQuery(api.public.project, { slug });
  const { t, L } = useLang();
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (data?.project) document.title = `${L(data.project.title)} — Marday 235`;
  }, [data, L]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (data === undefined) {
    return (
      <div className="container-x pt-32">
        <div className="h-8 w-40 animate-pulse rounded-full bg-white/5" />
        <div className="mt-6 h-14 w-2/3 animate-pulse rounded-xl bg-white/5" />
        <div className="card mt-10 aspect-[16/9] animate-pulse" />
      </div>
    );
  }
  if (data === null) return <NotFound />;

  const { project: p, next } = data;
  const title = L(p.title);
  const problem = L(p.problem);
  const solution = L(p.solution);
  const hasBody = Boolean(problem || solution || p.images.length > 1);

  return (
    <article className="container-x pt-28 sm:pt-32">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link to="/#projets">
          <ArrowLeft /> {t("goBack")}
        </Link>
      </Button>

      <Reveal className="mt-6 max-w-3xl">
        <p className="eyebrow">{p.year}</p>
        <h1 className="mt-3 text-4xl font-bold text-balance sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg text-pretty text-muted">{L(p.summary)}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          {p.liveUrl && (
            <Button asChild>
              <a href={p.liveUrl} target="_blank" rel="noreferrer">
                {t("live")} <ArrowUpRight />
              </a>
            </Button>
          )}
          {p.githubUrl && (
            <Button asChild variant="outline">
              <a href={p.githubUrl} target="_blank" rel="noreferrer">
                <FaGithub /> {t("code")}
              </a>
            </Button>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        {p.images.length > 0 ? (
          <button onClick={() => setZoom(p.images[0])} className="group card block w-full cursor-zoom-in overflow-hidden">
            <ProjectCover image={p.images[0]} title={title} slug={p.slug} className="aspect-[16/9]" />
          </button>
        ) : (
          <div className="group card overflow-hidden">
            <ProjectCover title={title} slug={p.slug} className="aspect-[16/9]" />
          </div>
        )}
      </Reveal>

      <div className={hasBody ? "mt-14 grid gap-10 lg:grid-cols-[1fr_280px]" : "mt-10"}>
        {hasBody && <div className="space-y-10">
          {problem && (
            <Reveal>
              <h2 className="text-2xl font-bold">{t("problem")}</h2>
              <p className="mt-3 whitespace-pre-line text-pretty text-fg/80">{problem}</p>
            </Reveal>
          )}
          {solution && (
            <Reveal>
              <h2 className="text-2xl font-bold">{t("solution")}</h2>
              <p className="mt-3 whitespace-pre-line text-pretty text-fg/80">{solution}</p>
            </Reveal>
          )}
          {p.images.length > 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {p.images.slice(1).map((src) => (
                <button key={src} onClick={() => setZoom(src)} className="group card cursor-zoom-in overflow-hidden">
                  <ProjectCover image={src} title={title} slug={p.slug} className="aspect-[16/10]" />
                </button>
              ))}
            </div>
          )}
        </div>}
        <aside className={hasBody ? "card h-fit space-y-5 p-6 lg:sticky lg:top-24" : "card flex flex-wrap gap-x-12 gap-y-5 p-6 sm:w-fit"}>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">{t("year")}</p>
            <p className="mt-1 font-medium">{p.year}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">{t("stack")}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {p.techs.map((tech) => (
                <li key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {next && (
        <Reveal className="mt-20">
          <Link to={`/projets/${next.slug}`} className="group card flex items-center justify-between p-6 transition-colors hover:border-white/20 sm:p-8">
            <div>
              <p className="text-sm text-muted">{t("nextProject")}</p>
              <p className="mt-1 font-display text-2xl font-bold group-hover:text-td-yellow">{L(next.title)}</p>
            </div>
            <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      )}

      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
            onClick={() => setZoom(null)}
            role="dialog"
            aria-modal
          >
            <button className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fermer">
              <X />
            </button>
            <img src={zoom} alt={title} className="max-h-full max-w-full rounded-xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
