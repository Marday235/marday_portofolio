import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, Briefcase, GraduationCap, Quote } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { motion, useReducedMotion } from "motion/react";
import DotGrid from "@/components/fx/DotGrid";
import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import { Button } from "@/components/ui/button";
import ProjectCover from "./ProjectCover";
import Socials from "./Socials";
import { useLang } from "@/lib/i18n";
import { skillIcon } from "@/lib/skillIcons";
import type { HomeData, PublicProject, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <Reveal className="mb-10 sm:mb-14">
      <p className="eyebrow" id={id}>
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold text-balance sm:text-4xl">{title}</h2>
    </Reveal>
  );
}

/* ───────────── Hero ───────────── */

export function AvailabilityBadge({ available }: { available: boolean }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        available ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/5 text-muted",
      )}
    >
      <span className="relative flex size-2">
        {available && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={cn("relative inline-flex size-2 rounded-full", available ? "bg-emerald-400" : "bg-muted")} />
      </span>
      {available ? t("available") : t("busy")}
    </span>
  );
}

export function Hero({ settings }: { settings?: Settings }) {
  const { t, L } = useLang();
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]">
        <DotGrid />
      </div>
      <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-td-blue/10 blur-[120px]" />

      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.div {...fade(0)}>
            <AvailabilityBadge available={settings?.available ?? true} />
          </motion.div>
          <motion.p {...fade(0.1)} className="mt-6 text-lg text-muted">
            {t("hello")} 👋
          </motion.p>
          <motion.h1 {...fade(0.18)} className="mt-2 text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="shiny">Abdoulaye Wardougou</span>
            <BadgeCheck className="ml-2 inline size-7 -translate-y-1 text-td-blue sm:size-9" aria-hidden />
          </motion.h1>
          <motion.p {...fade(0.26)} className="mt-4 font-display text-xl font-medium sm:text-2xl">
            {t("role")} <span className="whitespace-nowrap text-muted">· Marday 235</span>
          </motion.p>
          <motion.p {...fade(0.34)} className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg lg:mx-0">
            {settings ? L(settings.tagline) : " "}
          </motion.p>
          <motion.div {...fade(0.42)} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/#projets">
                {t("seeProjects")} <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/#contact">{t("contactMe")}</Link>
            </Button>
          </motion.div>
          <motion.div {...fade(0.5)} className="mt-8 flex justify-center lg:justify-start">
            <Socials settings={settings} className="justify-center lg:justify-start" />
          </motion.div>
        </div>

        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } })}
          className="order-1 mx-auto lg:order-2"
        >
          <div className="relative size-56 sm:size-72 lg:size-[22rem]">
            {/* Anneau aux couleurs du drapeau */}
            <div
              className="absolute -inset-2 rounded-full opacity-90 blur-[2px] motion-safe:animate-[spin_18s_linear_infinite]"
              style={{ background: "conic-gradient(from 0deg, #2f6bff, #fecb00, #e5304a, #2f6bff)" }}
            />
            <div className="absolute -inset-10 rounded-full bg-td-yellow/10 blur-3xl" />
            <img
              src="/marday.webp"
              alt="Abdoulaye Wardougou"
              width={640}
              height={640}
              fetchPriority="high"
              className="relative size-full rounded-full border-4 border-ink object-cover"
            />
            <span className="absolute -right-1 bottom-6 rounded-full border border-white/10 bg-surface/90 px-3 py-1.5 text-sm font-medium shadow-xl backdrop-blur sm:-right-4">
              📍 Douala 🇹🇩
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── Chiffres ───────────── */

export function Stats({ settings }: { settings?: Settings }) {
  const { L } = useLang();
  if (!settings || settings.stats.length === 0) return null;
  return (
    <section className="container-x">
      <div className={cn("grid gap-3 sm:gap-4", settings.stats.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {settings.stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="h-full">
            <div className="card h-full px-4 py-6 text-center sm:py-8">
              <p className="font-display text-3xl font-bold sm:text-5xl">
                <CountUp to={s.value} />
                <span className="text-td-yellow">{s.suffix}</span>
              </p>
              <p className="mt-2 text-xs text-muted sm:text-sm">{L(s.label)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Projets ───────────── */

function TechList({ techs, className }: { techs: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {techs.map((tech) => (
        <li key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-fg/80">
          {tech}
        </li>
      ))}
    </ul>
  );
}

function FeaturedProject({ p, index }: { p: PublicProject; index: number }) {
  const { t, L } = useLang();
  const flip = index % 2 === 1;
  return (
    <Reveal>
      <article className="group card grid overflow-hidden lg:grid-cols-2">
        <Link to={`/projets/${p.slug}`} className={cn("block aspect-[16/10] lg:aspect-auto lg:min-h-[340px]", flip && "lg:order-2")} tabIndex={-1}>
          <ProjectCover image={p.images[0]} title={L(p.title)} slug={p.slug} className="h-full w-full" />
        </Link>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-sm text-muted">{p.year}</p>
          <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
            <Link to={`/projets/${p.slug}`} className="hover:text-td-yellow">
              {L(p.title)}
            </Link>
          </h3>
          <p className="mt-3 text-pretty text-muted">{L(p.summary)}</p>
          <TechList techs={p.techs} className="mt-5" />
          <div className="mt-7 flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/projets/${p.slug}`}>
                {t("viewProject")} <ArrowRight />
              </Link>
            </Button>
            {p.liveUrl && (
              <Button asChild variant="outline">
                <a href={p.liveUrl} target="_blank" rel="noreferrer">
                  {t("live")} <ArrowUpRight />
                </a>
              </Button>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function SmallProject({ p, i }: { p: PublicProject; i: number }) {
  const { t, L } = useLang();
  return (
    <Reveal delay={i * 0.06}>
      <article className="group card flex h-full flex-col overflow-hidden">
        <Link to={`/projets/${p.slug}`} tabIndex={-1}>
          <ProjectCover image={p.images[0]} title={L(p.title)} slug={p.slug} className="aspect-[16/10]" />
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <h4 className="text-lg font-semibold">
            <Link to={`/projets/${p.slug}`} className="hover:text-td-yellow">
              {L(p.title)}
            </Link>
          </h4>
          <p className="mt-1.5 flex-1 text-sm text-muted">{L(p.summary)}</p>
          <div className="mt-4 flex gap-2">
            {p.liveUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={p.liveUrl} target="_blank" rel="noreferrer">
                  {t("live")} <ArrowUpRight />
                </a>
              </Button>
            )}
            {p.githubUrl && (
              <Button asChild size="sm" variant="ghost">
                <a href={p.githubUrl} target="_blank" rel="noreferrer">
                  <FaGithub /> {t("code")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Projects({ data }: { data?: HomeData }) {
  const { t } = useLang();
  return (
    <section className="container-x pt-24 sm:pt-32">
      <SectionHeading id="projets" eyebrow={t("projectsEyebrow")} title={t("projectsTitle")} />
      {!data ? (
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="card h-[340px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.mainProjects.map((p, i) => (
            <FeaturedProject key={p._id} p={p} index={i} />
          ))}
        </div>
      )}

      {data && data.otherProjects.length > 0 && (
        <div className="mt-20">
          <Reveal className="mb-8">
            <h3 className="text-2xl font-bold">{t("otherProjects")}</h3>
            <p className="mt-1 text-muted">{t("otherProjectsSub")}</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.otherProjects.map((p, i) => (
              <SmallProject key={p._id} p={p} i={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────── Parcours ───────────── */

export function Journey({ items }: { items?: HomeData["timeline"] }) {
  const { t, L } = useLang();
  if (!items || items.length === 0) return null;
  return (
    <section className="container-x pt-24 sm:pt-32">
      <SectionHeading id="parcours" eyebrow={t("journeyEyebrow")} title={t("journeyTitle")} />
      <ol className="relative ml-3 border-l border-white/10 sm:ml-4">
        {items.map((item, i) => {
          const Icon = item.kind === "work" ? Briefcase : GraduationCap;
          return (
            <li key={item._id} className="relative pb-10 pl-8 last:pb-0 sm:pl-12">
              <span
                className={cn(
                  "absolute -left-[17px] top-0 grid size-8 place-items-center rounded-full border-4 border-ink",
                  item.kind === "work" ? "bg-td-blue" : "bg-td-yellow text-ink",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <Reveal delay={i * 0.05}>
                <div className="card p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span className="font-medium text-td-yellow">
                      {item.start} — {item.end || t("present")}
                    </span>
                    <span>·</span>
                    <span>{item.kind === "work" ? t("work") : t("education")}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{L(item.title)}</h3>
                  {item.place && <p className="text-sm text-muted">{item.place}</p>}
                  {L(item.description) && <p className="mt-3 text-pretty text-fg/80">{L(item.description)}</p>}
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───────────── Compétences ───────────── */

export function Skills({ items }: { items?: HomeData["skills"] }) {
  const { t } = useLang();
  if (!items || items.length === 0) return null;
  const groups = (["front", "back", "tools"] as const)
    .map((cat) => ({ cat, list: items.filter((s) => s.category === cat) }))
    .filter((g) => g.list.length > 0);
  const accent = { front: "bg-td-blue", back: "bg-td-yellow", tools: "bg-td-red" };
  return (
    <section className="container-x pt-24 sm:pt-32">
      <SectionHeading id="competences" eyebrow={t("skillsEyebrow")} title={t("skillsTitle")} />
      <div className="grid gap-5 md:grid-cols-3">
        {groups.map(({ cat, list }, gi) => (
          <Reveal key={cat} delay={gi * 0.08}>
            <div className="card h-full p-6">
              <div className="flex items-center gap-3">
                <span className={cn("h-5 w-1.5 rounded-full", accent[cat])} />
                <h3 className="text-lg font-semibold">{t(cat)}</h3>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {list.map((s) => {
                  const { icon: Icon, color } = skillIcon(s.icon);
                  return (
                    <li
                      key={s._id}
                      className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <Icon className="size-4 shrink-0" style={{ color }} />
                      <span className="truncate">{s.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Témoignages ───────────── */

export function Testimonials({ items }: { items?: HomeData["testimonials"] }) {
  const { t, L } = useLang();
  if (!items || items.length === 0) return null;
  return (
    <section className="container-x pt-24 sm:pt-32">
      <SectionHeading eyebrow={t("testimonialsEyebrow")} title={t("testimonialsTitle")} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((tm, i) => (
          <Reveal key={tm._id} delay={i * 0.06}>
            <figure className="card flex h-full flex-col p-6">
              <Quote className="size-6 text-td-yellow" />
              <blockquote className="mt-4 flex-1 text-pretty text-fg/90">« {L(tm.quote)} »</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="font-semibold">{tm.name}</p>
                {tm.role && <p className="text-sm text-muted">{tm.role}</p>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
