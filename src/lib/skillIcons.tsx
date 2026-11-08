import type { IconType } from "react-icons";
import {
  SiCloudflare,
  SiConvex,
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGsap,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiReact,
  SiReactrouter,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import { FiCode } from "react-icons/fi";

/** Icônes disponibles dans l'admin (clé → icône + couleur de marque). */
export const SKILL_ICONS: Record<string, { icon: IconType; color: string; label: string }> = {
  react: { icon: SiReact, color: "#61DAFB", label: "React" },
  typescript: { icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
  javascript: { icon: SiJavascript, color: "#F7DF1E", label: "JavaScript" },
  tailwind: { icon: SiTailwindcss, color: "#38BDF8", label: "Tailwind" },
  html: { icon: SiHtml5, color: "#E34F26", label: "HTML" },
  css: { icon: SiCss, color: "#663399", label: "CSS" },
  next: { icon: SiNextdotjs, color: "#FFFFFF", label: "Next.js" },
  shadcn: { icon: SiShadcnui, color: "#FFFFFF", label: "shadcn/ui" },
  gsap: { icon: SiGsap, color: "#88CE02", label: "GSAP" },
  router: { icon: SiReactrouter, color: "#F44250", label: "React Router" },
  node: { icon: SiNodedotjs, color: "#5FA04E", label: "Node.js" },
  express: { icon: SiExpress, color: "#FFFFFF", label: "Express" },
  convex: { icon: SiConvex, color: "#EE342F", label: "Convex" },
  mongodb: { icon: SiMongodb, color: "#47A248", label: "MongoDB" },
  postgresql: { icon: SiPostgresql, color: "#4169E1", label: "PostgreSQL" },
  firebase: { icon: SiFirebase, color: "#FFCA28", label: "Firebase" },
  python: { icon: SiPython, color: "#3776AB", label: "Python" },
  java: { icon: SiOpenjdk, color: "#ED8B00", label: "Java" },
  git: { icon: SiGit, color: "#F05032", label: "Git" },
  github: { icon: SiGithub, color: "#FFFFFF", label: "GitHub" },
  vite: { icon: SiVite, color: "#9468FF", label: "Vite" },
  cloudflare: { icon: SiCloudflare, color: "#F38020", label: "Cloudflare" },
  docker: { icon: SiDocker, color: "#2496ED", label: "Docker" },
  figma: { icon: SiFigma, color: "#F24E1E", label: "Figma" },
  other: { icon: FiCode, color: "#9a9ab0", label: "Autre" },
};

export function skillIcon(key: string) {
  return SKILL_ICONS[key] ?? SKILL_ICONS.other;
}
