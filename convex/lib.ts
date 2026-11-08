import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Vérifie le jeton de session de l'admin. Lève une erreur sinon. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx, token: string) {
  if (!token) throw new ConvexError("Non connecté");
  const tokenHash = await sha256(token);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError("Session expirée, reconnectez-vous");
  }
  return session;
}

/** Limite simple par fenêtre glissante. Renvoie false si la limite est dépassée. */
export async function hitRateLimit(
  ctx: MutationCtx,
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const row = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (!row || now - row.windowStart > windowMs) {
    if (row) await ctx.db.patch(row._id, { windowStart: now, count: 1 });
    else await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
    return true;
  }
  if (row.count >= max) return false;
  await ctx.db.patch(row._id, { count: row.count + 1 });
  return true;
}

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
