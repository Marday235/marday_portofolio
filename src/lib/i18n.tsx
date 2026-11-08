import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "fr" | "en";
export type Localized = { fr: string; en: string };

const dict = {
  navProjects: { fr: "Projets", en: "Projects" },
  navJourney: { fr: "Parcours", en: "Journey" },
  navSkills: { fr: "Compétences", en: "Skills" },
  navContact: { fr: "Contact", en: "Contact" },
  navGallery: { fr: "Galerie", en: "Gallery" },
  galleryEyebrow: { fr: "Mon univers", en: "Behind the code" },
  galleryTitle: { fr: "Moments, aventures & coulisses.", en: "Moments, adventures & behind-the-scenes." },
  seeAll: { fr: "Tout voir", en: "View all" },
  close: { fr: "Fermer", en: "Close" },
  prev: { fr: "Précédente", en: "Previous" },
  next: { fr: "Suivante", en: "Next" },
  cv: { fr: "CV", en: "Resume" },
  menu: { fr: "Menu", en: "Menu" },
  available: { fr: "Disponible pour missions", en: "Available for work" },
  busy: { fr: "Actuellement en mission", en: "Currently booked" },
  hello: { fr: "Salut, je suis", en: "Hi, I'm" },
  role: { fr: "Développeur Full Stack", en: "Full Stack Developer" },
  seeProjects: { fr: "Voir mes projets", en: "See my work" },
  contactMe: { fr: "Me contacter", en: "Get in touch" },
  projectsEyebrow: { fr: "Réalisations", en: "Selected work" },
  projectsTitle: { fr: "Des projets réels, en ligne et utilisés", en: "Real projects, live and in use" },
  viewProject: { fr: "Voir le projet", en: "View project" },
  live: { fr: "Site en ligne", en: "Live site" },
  code: { fr: "Code", en: "Code" },
  otherProjects: { fr: "Autres projets", en: "Other projects" },
  otherProjectsSub: { fr: "Mini-jeux et exercices pour aiguiser la logique.", en: "Mini-games and exercises to sharpen logic." },
  journeyEyebrow: { fr: "Parcours", en: "Journey" },
  journeyTitle: { fr: "Formation et expériences", en: "Education & experience" },
  present: { fr: "aujourd'hui", en: "present" },
  work: { fr: "Expérience", en: "Experience" },
  education: { fr: "Formation", en: "Education" },
  skillsEyebrow: { fr: "Compétences", en: "Skills" },
  skillsTitle: { fr: "Les outils que j'utilise au quotidien", en: "Tools I use every day" },
  front: { fr: "Front-end", en: "Front-end" },
  back: { fr: "Back-end", en: "Back-end" },
  tools: { fr: "Outils", en: "Tools" },
  testimonialsEyebrow: { fr: "Témoignages", en: "Testimonials" },
  testimonialsTitle: { fr: "Ils m'ont fait confiance", en: "What clients say" },
  contactBig1: { fr: "Un projet\u00a0?", en: "Got a project?" },
  contactBig2: { fr: "Parlons-en.", en: "Let's talk." },
  replyFast: { fr: "Réponse en moins de 24\u00a0h", en: "Reply within 24 hours" },
  writeMessage: { fr: "Écrire un message", en: "Send a message" },
  copied: { fr: "Copié\u00a0!", en: "Copied!" },
  contactEyebrow: { fr: "Contact", en: "Contact" },
  contactTitle: { fr: "Un projet en tête\u00a0? Parlons-en.", en: "Have a project in mind? Let's talk." },
  contactSub: {
    fr: "Écrivez-moi : je réponds en général sous 24 h. Pour aller plus vite, passez par WhatsApp.",
    en: "Send me a message — I usually reply within 24 hours. For a faster answer, use WhatsApp.",
  },
  name: { fr: "Votre nom", en: "Your name" },
  email: { fr: "Votre email", en: "Your email" },
  message: { fr: "Votre message", en: "Your message" },
  messagePh: { fr: "Décrivez votre projet, vos délais, votre budget…", en: "Tell me about your project, timeline, budget…" },
  send: { fr: "Envoyer le message", en: "Send message" },
  sending: { fr: "Envoi…", en: "Sending…" },
  sent: { fr: "Merci ! Votre message est bien arrivé. Je vous réponds vite.", en: "Thanks! Your message arrived. I'll get back to you soon." },
  sendAnother: { fr: "Envoyer un autre message", en: "Send another message" },
  whatsapp: { fr: "Écrire sur WhatsApp", en: "Chat on WhatsApp" },
  waHello: { fr: "Bonjour Abdoulaye, je vous contacte depuis votre portfolio.", en: "Hi Abdoulaye, I'm reaching out from your portfolio." },
  err_invalid_name: { fr: "Indiquez votre nom.", en: "Please enter your name." },
  err_invalid_email: { fr: "Cette adresse email n'est pas valide.", en: "This email address is not valid." },
  err_invalid_body: { fr: "Votre message doit faire au moins 10 caractères.", en: "Your message must be at least 10 characters." },
  err_captcha: { fr: "Vérification anti-robot échouée, réessayez.", en: "Anti-bot check failed, please try again." },
  err_rate_limit: { fr: "Trop de messages envoyés. Réessayez dans une heure ou passez par WhatsApp.", en: "Too many messages. Try again in an hour or use WhatsApp." },
  err_generic: { fr: "L'envoi a échoué. Réessayez ou passez par WhatsApp.", en: "Sending failed. Please retry or use WhatsApp." },
  goBack: { fr: "Retour", en: "Back" },
  problem: { fr: "Le problème", en: "The problem" },
  solution: { fr: "La solution", en: "The solution" },
  stack: { fr: "Technologies", en: "Tech stack" },
  year: { fr: "Année", en: "Year" },
  nextProject: { fr: "Projet suivant", en: "Next project" },
  notFound: { fr: "Cette page n'existe pas.", en: "This page doesn't exist." },
  home: { fr: "Retour à l'accueil", en: "Back home" },
  rights: { fr: "Tous droits réservés.", en: "All rights reserved." },
  madeIn: { fr: "Fait avec ❤️ à Douala", en: "Made with ❤️ in Douala" },
} satisfies Record<string, Localized>;

export type DictKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
  /** Texte venant de la base : anglais si rempli, sinon français. */
  L: (v: Localized | undefined) => string;
};

const LangContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "fr" || saved === "en") return saved;
  } catch {
    /* stockage indisponible */
  }
  return "fr";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => dict[k][lang],
      L: (v) => (v ? (lang === "en" && v.en.trim() ? v.en : v.fr) : ""),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang hors de LangProvider");
  return ctx;
}
