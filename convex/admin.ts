import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin, slugify } from "./lib";
import {
  galleryFields,
  projectFields,
  settingsFields,
  skillFields,
  testimonialFields,
  timelineFields,
} from "./schema";
import { loadSettings } from "./public";
import { DEFAULT_SETTINGS, SEED_GALLERY, SEED_PROJECTS, SEED_SKILLS, SEED_TIMELINE } from "./seedData";

const token = v.string();

function omitOrder<T extends { order: unknown }>(fields: T): Omit<T, "order"> {
  const { order: _ignored, ...rest } = fields;
  return rest;
}

type OrderedTable = "projects" | "timeline" | "skills" | "testimonials" | "gallery";

async function nextOrder(ctx: MutationCtx, table: OrderedTable) {
  const last = await ctx.db.query(table).withIndex("by_order").order("desc").first();
  return last ? last.order + 1 : 0;
}

/* ───────────── Tableau de bord ───────────── */

export const overview = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_read", (q) => q.eq("read", false))
      .collect();
    const projects = await ctx.db.query("projects").collect();
    return { unread: unread.length, projects: projects.length };
  },
});

export const generateUploadUrl = mutation({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await ctx.storage.generateUploadUrl();
  },
});

/* ───────────── Messages ───────────── */

export const listMessages = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await ctx.db.query("messages").order("desc").take(500);
  },
});

export const setMessageRead = mutation({
  args: { token, id: v.id("messages"), read: v.boolean() },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.patch(a.id, { read: a.read });
  },
});

export const removeMessage = mutation({
  args: { token, id: v.id("messages") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.delete(a.id);
  },
});

/* ───────────── Projets ───────────── */

export const listProjects = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const rows = await ctx.db.query("projects").withIndex("by_order").collect();
    return await Promise.all(
      rows.map(async (p) => ({
        ...p,
        uploaded: await Promise.all(
          p.imageIds.map(async (id) => ({ id, url: await ctx.storage.getUrl(id) })),
        ),
      })),
    );
  },
});

export const saveProject = mutation({
  args: {
    token,
    id: v.optional(v.id("projects")),
    data: v.object(omitOrder(projectFields)),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const data = { ...a.data };
    data.slug = slugify(data.slug || data.title.fr);
    if (!data.slug) throw new ConvexError("Le titre est obligatoire.");
    if (!data.title.fr.trim()) throw new ConvexError("Le titre en français est obligatoire.");

    const clash = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", data.slug))
      .unique();
    if (clash && clash._id !== a.id) {
      throw new ConvexError(`L'adresse « ${data.slug} » est déjà utilisée par un autre projet.`);
    }

    if (a.id) {
      const old = await ctx.db.get(a.id);
      if (!old) throw new ConvexError("Projet introuvable.");
      // Supprime les images retirées du projet
      for (const img of old.imageIds) {
        if (!data.imageIds.includes(img)) await ctx.storage.delete(img);
      }
      await ctx.db.patch(a.id, data);
      return a.id;
    }
    return await ctx.db.insert("projects", { ...data, order: await nextOrder(ctx, "projects") });
  },
});

export const removeProject = mutation({
  args: { token, id: v.id("projects") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const p = await ctx.db.get(a.id);
    if (!p) return;
    for (const img of p.imageIds) await ctx.storage.delete(img);
    await ctx.db.delete(a.id);
  },
});

export const deleteUpload = mutation({
  args: { token, storageId: v.id("_storage") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    // Seulement si le fichier n'est rattaché à rien
    const used = (await ctx.db.query("projects").collect()).some((p) =>
      p.imageIds.includes(a.storageId),
    );
    if (!used) await ctx.storage.delete(a.storageId);
  },
});

/* ───────────── Parcours ───────────── */

export const listTimeline = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await ctx.db.query("timeline").withIndex("by_order").collect();
  },
});

export const saveTimeline = mutation({
  args: { token, id: v.optional(v.id("timeline")), data: v.object(omitOrder(timelineFields)) },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    if (!a.data.title.fr.trim()) throw new ConvexError("Le titre est obligatoire.");
    if (a.id) {
      await ctx.db.patch(a.id, a.data);
      return a.id;
    }
    return await ctx.db.insert("timeline", { ...a.data, order: await nextOrder(ctx, "timeline") });
  },
});

export const removeTimeline = mutation({
  args: { token, id: v.id("timeline") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.delete(a.id);
  },
});

/* ───────────── Compétences ───────────── */

export const listSkills = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await ctx.db.query("skills").withIndex("by_order").collect();
  },
});

export const saveSkill = mutation({
  args: { token, id: v.optional(v.id("skills")), data: v.object(omitOrder(skillFields)) },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    if (!a.data.name.trim()) throw new ConvexError("Le nom est obligatoire.");
    if (a.id) {
      await ctx.db.patch(a.id, a.data);
      return a.id;
    }
    return await ctx.db.insert("skills", { ...a.data, order: await nextOrder(ctx, "skills") });
  },
});

export const removeSkill = mutation({
  args: { token, id: v.id("skills") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.delete(a.id);
  },
});

/* ───────────── Témoignages ───────────── */

export const listTestimonials = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await ctx.db.query("testimonials").withIndex("by_order").collect();
  },
});

export const saveTestimonial = mutation({
  args: {
    token,
    id: v.optional(v.id("testimonials")),
    data: v.object(omitOrder(testimonialFields)),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    if (!a.data.name.trim() || !a.data.quote.fr.trim()) {
      throw new ConvexError("Le nom et le témoignage sont obligatoires.");
    }
    if (a.id) {
      await ctx.db.patch(a.id, a.data);
      return a.id;
    }
    return await ctx.db.insert("testimonials", {
      ...a.data,
      order: await nextOrder(ctx, "testimonials"),
    });
  },
});

export const removeTestimonial = mutation({
  args: { token, id: v.id("testimonials") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.delete(a.id);
  },
});

/* ───────────── Galerie ───────────── */

export const listGallery = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const rows = await ctx.db.query("gallery").withIndex("by_order").collect();
    return await Promise.all(
      rows.map(async (g) => ({
        ...g,
        url: g.imageId ? await ctx.storage.getUrl(g.imageId) : (g.staticImage ?? null),
      })),
    );
  },
});

/** Ajoute plusieurs photos d'un coup (après envoi vers le stockage). */
export const addGalleryPhotos = mutation({
  args: { token, imageIds: v.array(v.id("_storage")) },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    // Les nouvelles photos passent en tête de la galerie
    const rows = await ctx.db.query("gallery").withIndex("by_order").collect();
    for (const r of rows) await ctx.db.patch(r._id, { order: r.order + a.imageIds.length });
    for (let i = 0; i < a.imageIds.length; i++) {
      await ctx.db.insert("gallery", {
        imageId: a.imageIds[i],
        caption: { fr: "", en: "" },
        published: true,
        order: i,
      });
    }
  },
});

export const updateGalleryPhoto = mutation({
  args: {
    token,
    id: v.id("gallery"),
    caption: galleryFields.caption,
    published: galleryFields.published,
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    await ctx.db.patch(a.id, { caption: a.caption, published: a.published });
  },
});

export const removeGalleryPhoto = mutation({
  args: { token, id: v.id("gallery") },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const g = await ctx.db.get(a.id);
    if (!g) return;
    if (g.imageId) await ctx.storage.delete(g.imageId);
    await ctx.db.delete(a.id);
  },
});

/* ───────────── Réordonner (flèches haut/bas) ───────────── */

export const move = mutation({
  args: {
    token,
    table: v.union(
      v.literal("projects"),
      v.literal("timeline"),
      v.literal("skills"),
      v.literal("testimonials"),
      v.literal("gallery"),
    ),
    id: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const rows = await ctx.db.query(a.table).withIndex("by_order").collect();
    const i = rows.findIndex((r) => r._id === a.id);
    const j = a.direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return;
    // Renumérote proprement puis échange les deux éléments
    const ids = rows.map((r) => r._id as Id<OrderedTable>);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (let k = 0; k < ids.length; k++) {
      await ctx.db.patch(ids[k], { order: k });
    }
  },
});

/* ───────────── Réglages ───────────── */

export const getSettings = query({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await loadSettings(ctx);
  },
});

const { cvFr: _cvFr, cvEn: _cvEn, ...editableSettings } = settingsFields;

async function ensureSettings(ctx: MutationCtx) {
  const s = await ctx.db.query("settings").first();
  if (s) return s;
  const id = await ctx.db.insert("settings", { ...DEFAULT_SETTINGS });
  return (await ctx.db.get(id))!;
}

export const saveSettings = mutation({
  args: { token, data: v.object(editableSettings) },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const s = await ensureSettings(ctx);
    await ctx.db.patch(s._id, a.data);
  },
});

export const setAvailable = mutation({
  args: { token, available: v.boolean() },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const s = await ensureSettings(ctx);
    await ctx.db.patch(s._id, { available: a.available });
  },
});

export const setCv = mutation({
  args: {
    token,
    lang: v.union(v.literal("fr"), v.literal("en")),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    const s = await ensureSettings(ctx);
    const field = a.lang === "fr" ? "cvFr" : "cvEn";
    const old = s[field];
    if (old && old !== a.storageId) await ctx.storage.delete(old);
    await ctx.db.patch(s._id, { [field]: a.storageId });
  },
});

/* ───────────── Contenu de départ ───────────── */

/** Remplit chaque partie encore vide. Ne touche jamais à ce qui existe déjà. */
async function runSeed(ctx: MutationCtx) {
  let added = false;
  await ensureSettings(ctx);
  if (!(await ctx.db.query("projects").first())) {
    for (const p of SEED_PROJECTS) await ctx.db.insert("projects", p);
    for (const s of SEED_SKILLS) await ctx.db.insert("skills", s);
    for (const t of SEED_TIMELINE) await ctx.db.insert("timeline", t);
    added = true;
  }
  if (!(await ctx.db.query("gallery").first())) {
    for (const g of SEED_GALLERY) await ctx.db.insert("gallery", g);
    added = true;
  }
  return added;
}

export const seed = mutation({
  args: { token },
  handler: async (ctx, a) => {
    await requireAdmin(ctx, a.token);
    return await runSeed(ctx);
  },
});

/** `npx convex run admin:seedInit` depuis le terminal. */
export const seedInit = internalMutation({
  args: {},
  handler: async (ctx) => runSeed(ctx),
});
