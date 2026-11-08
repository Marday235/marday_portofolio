import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Texte bilingue : le champ `en` peut rester vide, le site affiche alors `fr`. */
export const localized = v.object({ fr: v.string(), en: v.string() });

export const projectFields = {
  slug: v.string(),
  title: localized,
  summary: localized,
  problem: localized,
  solution: localized,
  imageIds: v.array(v.id("_storage")),
  /** Images servies depuis /public (contenu de départ). */
  staticImages: v.array(v.string()),
  techs: v.array(v.string()),
  liveUrl: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  year: v.number(),
  featured: v.boolean(),
  category: v.union(v.literal("main"), v.literal("other")),
  status: v.union(v.literal("draft"), v.literal("published")),
  order: v.number(),
};

export const timelineFields = {
  kind: v.union(v.literal("work"), v.literal("education")),
  title: localized,
  place: v.string(),
  start: v.string(),
  end: v.optional(v.string()),
  description: localized,
  order: v.number(),
};

export const skillFields = {
  name: v.string(),
  category: v.union(v.literal("front"), v.literal("back"), v.literal("tools")),
  icon: v.string(),
  order: v.number(),
};

export const testimonialFields = {
  name: v.string(),
  role: v.string(),
  quote: localized,
  published: v.boolean(),
  order: v.number(),
};

export const galleryFields = {
  imageId: v.optional(v.id("_storage")),
  /** Photo servie depuis /public (contenu de départ). */
  staticImage: v.optional(v.string()),
  caption: localized,
  published: v.boolean(),
  order: v.number(),
};

export const statField = v.object({
  value: v.number(),
  suffix: v.string(),
  label: localized,
});

export const settingsFields = {
  tagline: localized,
  available: v.boolean(),
  stats: v.array(statField),
  whatsapp: v.string(),
  email: v.string(),
  github: v.string(),
  x: v.string(),
  facebook: v.string(),
  linkedin: v.string(),
  cvFr: v.optional(v.id("_storage")),
  cvEn: v.optional(v.id("_storage")),
};

export default defineSchema({
  projects: defineTable(projectFields)
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),
  timeline: defineTable(timelineFields).index("by_order", ["order"]),
  skills: defineTable(skillFields).index("by_order", ["order"]),
  testimonials: defineTable(testimonialFields).index("by_order", ["order"]),
  gallery: defineTable(galleryFields).index("by_order", ["order"]),
  settings: defineTable(settingsFields),
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    body: v.string(),
    lang: v.string(),
    read: v.boolean(),
  }).index("by_read", ["read"]),
  loginCodes: defineTable({
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
  }),
  sessions: defineTable({
    tokenHash: v.string(),
    expiresAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"]),
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),
});
