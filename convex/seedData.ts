import type { Infer } from "convex/values";
import { v } from "convex/values";
import {
  galleryFields,
  projectFields,
  settingsFields,
  skillFields,
  timelineFields,
} from "./schema";

const settingsV = v.object(settingsFields);
const projectV = v.object(projectFields);
const timelineV = v.object(timelineFields);
const skillV = v.object(skillFields);
const galleryV = v.object(galleryFields);

const L = (fr: string, en = "") => ({ fr, en });

/** Valeurs provisoires : à corriger dans /admin → Réglages. */
export const DEFAULT_SETTINGS: Infer<typeof settingsV> = {
  tagline: L(
    "Je crée des applications web rapides et modernes pour les entreprises et les associations.",
    "I build fast, modern web applications for businesses and non-profits.",
  ),
  available: true,
  stats: [
    { value: 4, suffix: "", label: L("ans d'expérience", "years of experience") },
    { value: 12, suffix: "+", label: L("projets livrés", "projects delivered") },
    { value: 5, suffix: "+", label: L("clients satisfaits", "happy clients") },
  ],
  whatsapp: "",
  email: "marday235@gmail.com",
  github: "https://github.com/Marday235",
  x: "https://x.com/marday235",
  facebook: "https://www.facebook.com/Mardaywardougoukhamis",
  linkedin: "",
};

export const SEED_PROJECTS: Infer<typeof projectV>[] = [
  {
    slug: "aseest-d",
    title: L("ASEEST/D — site et tableau de bord", "ASEEST/D — website & admin dashboard"),
    summary: L(
      "Le site officiel de l'association des étudiants tchadiens de Douala, avec un espace d'administration complet.",
      "The official website of the Chadian students' association in Douala, with a full admin dashboard.",
    ),
    problem: L(
      "L'association gérait son bureau, ses membres, sa galerie et les demandes de stage à la main, sans site à jour.",
      "The association managed its board, members, gallery and internship requests by hand, with no up-to-date website.",
    ),
    solution: L(
      "Un site public aux couleurs du Tchad et un tableau de bord temps réel : bureau, collaborateurs, galerie multi-images, certifications, candidatures de stage et export PDF.",
      "A public site in Chad's colours and a real-time dashboard: board, collaborators, multi-image gallery, certifications, internship applications and PDF export.",
    ),
    imageIds: [],
    staticImages: [],
    techs: ["React", "TypeScript", "Convex", "Tailwind", "shadcn/ui", "Cloudflare"],
    liveUrl: "https://aseestd.com",
    githubUrl: "https://github.com/Marday235/AssestD1",
    year: 2026,
    featured: true,
    category: "main",
    status: "published",
    order: 0,
  },
  {
    slug: "souk-tchad",
    title: L("SoukTchad — marketplace étudiante", "SoukTchad — student marketplace"),
    summary: L(
      "Une marketplace façon Facebook Marketplace pour les étudiants tchadiens de Douala, avec contact direct sur WhatsApp.",
      "A Facebook Marketplace-style app for Chadian students in Douala, with direct WhatsApp contact.",
    ),
    problem: L(
      "Les étudiants vendaient et achetaient via des groupes WhatsApp désordonnés, où les annonces se perdaient.",
      "Students bought and sold through messy WhatsApp groups where listings got lost.",
    ),
    solution: L(
      "Des annonces avec photos, des profils vendeurs, la recherche et les filtres par catégorie, et un bouton qui ouvre directement la conversation WhatsApp avec le vendeur.",
      "Listings with photos, seller profiles, search and category filters, and a button that opens a WhatsApp chat with the seller.",
    ),
    imageIds: [],
    staticImages: [],
    techs: ["React", "TypeScript", "Convex", "Tailwind", "shadcn/ui"],
    githubUrl: "https://github.com/Marday235/soukDouala",
    year: 2025,
    featured: true,
    category: "main",
    status: "published",
    order: 1,
  },
  {
    slug: "game-card",
    title: L("Game-Card"),
    summary: L(
      "Un mini-jeu de cartes à retourner et associer, avec une interface simple et soignée.",
      "A card-flipping memory mini-game with a clean, simple interface.",
    ),
    problem: L(""),
    solution: L(""),
    imageIds: [],
    staticImages: ["/projets/game-card.webp"],
    techs: ["HTML", "CSS", "JavaScript"],
    liveUrl: "https://card-game1.netlify.app/",
    githubUrl: "https://github.com/Marday235/projet-cards",
    year: 2024,
    featured: false,
    category: "other",
    status: "published",
    order: 2,
  },
  {
    slug: "tic-tac-toe",
    title: L("Tic Tac Toe", "Tic Tac Toe"),
    summary: L("Le morpion classique à deux joueurs.", "The classic two-player game."),
    problem: L(""),
    solution: L(""),
    imageIds: [],
    staticImages: ["/projets/tic-tac-toe.webp"],
    techs: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/Marday235/tic-tac-toe",
    year: 2024,
    featured: false,
    category: "other",
    status: "published",
    order: 3,
  },
  {
    slug: "pendu",
    title: L("Le Pendu", "Hangman"),
    summary: L(
      "Le jeu du pendu : devinez le mot lettre par lettre.",
      "Guess the word letter by letter.",
    ),
    problem: L(""),
    solution: L(""),
    imageIds: [],
    staticImages: ["/projets/pendu.webp"],
    techs: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/Marday235/pendu",
    year: 2024,
    featured: false,
    category: "other",
    status: "published",
    order: 4,
  },
];

export const SEED_SKILLS: Infer<typeof skillV>[] = [
  ["React", "front", "react"],
  ["TypeScript", "front", "typescript"],
  ["JavaScript", "front", "javascript"],
  ["Tailwind CSS", "front", "tailwind"],
  ["HTML", "front", "html"],
  ["CSS", "front", "css"],
  ["Node.js", "back", "node"],
  ["Express", "back", "express"],
  ["Convex", "back", "convex"],
  ["MongoDB", "back", "mongodb"],
  ["Python", "back", "python"],
  ["Git", "tools", "git"],
  ["GitHub", "tools", "github"],
  ["Vite", "tools", "vite"],
  ["Cloudflare", "tools", "cloudflare"],
  ["Figma", "tools", "figma"],
].map(([name, category, icon], order) => ({
  name,
  category: category as "front" | "back" | "tools",
  icon,
  order,
}));

export const SEED_TIMELINE: Infer<typeof timelineV>[] = [
  {
    kind: "work",
    title: L("Développeur Full Stack freelance", "Freelance Full Stack Developer"),
    place: "Douala",
    start: "2022",
    description: L(
      "Sites et applications web pour des associations et des petites entreprises. (Exemple — à modifier dans l'admin.)",
      "Websites and web apps for non-profits and small businesses. (Example — edit in the admin.)",
    ),
    order: 0,
  },
];

/** Photos de départ (dossier public/galerie) — légendes modifiables dans l'admin. */
export const SEED_GALLERY: Infer<typeof galleryV>[] = [
  ["code-nuit", "Late-night coding sur ASEEST/D", "Late-night coding on ASEEST/D"],
  ["portrait-canape", "Prêt pour le prochain défi", "Ready for the next challenge"],
  ["focus-tablette", "Concentré sur un nouveau projet", "Focused on a new project"],
  ["reflexion", "Réfléchir avant de coder", "Think first, code second"],
  ["export-pdf", "L'export PDF prend forme", "The PDF export takes shape"],
  ["salon-bleu", "Douala, entre deux sprints", "Douala, between two sprints"],
  ["detente", "Une pause, puis on repart", "A short break, then back at it"],
].map(([file, fr, en], order) => ({
  staticImage: `/galerie/${file}.webp`,
  caption: L(fr, en),
  published: true,
  order,
}));
