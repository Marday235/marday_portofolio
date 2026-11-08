import { v } from "convex/values";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { DEFAULT_SETTINGS } from "./seedData";

async function withImages(ctx: QueryCtx, p: Doc<"projects">) {
  const uploaded = await Promise.all(p.imageIds.map((id) => ctx.storage.getUrl(id)));
  const images = [...uploaded.filter((u): u is string => Boolean(u)), ...p.staticImages];
  return { ...p, images };
}

export async function loadSettings(ctx: QueryCtx) {
  const s = await ctx.db.query("settings").first();
  const base = s ?? { ...DEFAULT_SETTINGS };
  return {
    ...base,
    cvFrUrl: base.cvFr ? await ctx.storage.getUrl(base.cvFr) : null,
    cvEnUrl: base.cvEn ? await ctx.storage.getUrl(base.cvEn) : null,
  };
}

/** Tout ce que la page d'accueil affiche, en une seule requête. */
export const home = query({
  args: {},
  handler: async (ctx) => {
    const settings = await loadSettings(ctx);
    const projects = (await ctx.db.query("projects").withIndex("by_order").collect()).filter(
      (p) => p.status === "published",
    );
    const withImgs = await Promise.all(projects.map((p) => withImages(ctx, p)));
    const timeline = await ctx.db.query("timeline").withIndex("by_order").collect();
    const skills = await ctx.db.query("skills").withIndex("by_order").collect();
    const testimonials = (
      await ctx.db.query("testimonials").withIndex("by_order").collect()
    ).filter((t) => t.published);
    const galleryRows = (await ctx.db.query("gallery").withIndex("by_order").collect()).filter(
      (g) => g.published,
    );
    const gallery = (
      await Promise.all(
        galleryRows.map(async (g) => ({
          _id: g._id,
          caption: g.caption,
          url: g.imageId ? await ctx.storage.getUrl(g.imageId) : (g.staticImage ?? null),
        })),
      )
    ).filter((g): g is typeof g & { url: string } => Boolean(g.url));
    return {
      settings,
      gallery,
      mainProjects: withImgs.filter((p) => p.category === "main"),
      otherProjects: withImgs.filter((p) => p.category === "other"),
      timeline,
      skills,
      testimonials,
    };
  },
});

export const project = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p || p.status !== "published") return null;
    const all = (await ctx.db.query("projects").withIndex("by_order").collect()).filter(
      (x) => x.status === "published" && x.category === "main",
    );
    const idx = all.findIndex((x) => x._id === p._id);
    const next = idx >= 0 && all.length > 1 ? all[(idx + 1) % all.length] : null;
    return {
      project: await withImages(ctx, p),
      next: next && next._id !== p._id ? { slug: next.slug, title: next.title } : null,
    };
  },
});
