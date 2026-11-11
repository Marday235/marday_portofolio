import { v, ConvexError } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { adminEmail, hitRateLimit, randomHex, sha256 } from "./lib";
import { sendEmail } from "./lumail";

const CODE_TTL = 10 * 60 * 1000; // 10 minutes
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 jours
const MAX_ATTEMPTS = 5;

/** Étape 1 : l'admin saisit son email, on lui envoie un code à 6 chiffres. */
export const requestCode = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const admin = adminEmail();
    if (!admin) {
      throw new ConvexError("ADMIN_EMAIL n'est pas configuré dans Convex.");
    }
    // On répond toujours "ok" pour ne pas révéler quelle adresse est l'admin.
    if (email.trim().toLowerCase() !== admin) return { ok: true };

    const n = new Uint32Array(1);
    crypto.getRandomValues(n);
    const code = String(n[0] % 1_000_000).padStart(6, "0");

    const allowed = await ctx.runMutation(internal.auth.storeCode, {
      codeHash: await sha256(code),
    });
    if (!allowed) {
      throw new ConvexError("Trop de demandes. Réessayez dans 15 minutes.");
    }

    const sent = await sendEmail(
      admin,
      `Votre code de connexion : ${code}`,
      `<div style="font-family:sans-serif;font-size:16px">
        <p>Voici votre code pour l'espace admin de votre portfolio :</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p>
        <p style="color:#666">Il expire dans 10 minutes. Si vous n'avez rien demandé, ignorez cet email.</p>
      </div>`,
    );
    if (!sent) console.log(`[CODE ADMIN] ${code}`);
    return { ok: true };
  },
});

export const storeCode = internalMutation({
  args: { codeHash: v.string() },
  handler: async (ctx, { codeHash }) => {
    if (!(await hitRateLimit(ctx, "login-request", 5, 15 * 60 * 1000))) return false;
    for (const old of await ctx.db.query("loginCodes").collect()) {
      await ctx.db.delete(old._id);
    }
    await ctx.db.insert("loginCodes", {
      codeHash,
      expiresAt: Date.now() + CODE_TTL,
      attempts: 0,
    });
    return true;
  },
});

/** Étape 2 : l'admin saisit le code, on crée une session de 30 jours. */
export const verifyCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const row = await ctx.db.query("loginCodes").order("desc").first();
    if (!row || row.expiresAt < Date.now()) {
      return { ok: false as const, error: "Code expiré. Demandez-en un nouveau." };
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      await ctx.db.delete(row._id);
      return { ok: false as const, error: "Trop d'essais. Demandez un nouveau code." };
    }
    if ((await sha256(code.trim())) !== row.codeHash) {
      await ctx.db.patch(row._id, { attempts: row.attempts + 1 });
      return { ok: false as const, error: "Code incorrect." };
    }
    await ctx.db.delete(row._id);
    return { ok: true as const, token: await createSession(ctx) };
  },
});

/**
 * Connexion directe : email admin + code personnel.
 * Le code n'est jamais stocké en clair : Convex garde seulement son empreinte SHA-256
 * dans ADMIN_CODE_HASH. Les erreurs sont renvoyées (pas levées) pour que le
 * compteur anti-force-brute soit bien enregistré.
 */
export const loginWithCode = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, { email, code }) => {
    const admin = adminEmail();
    const codeHash = (process.env.ADMIN_CODE_HASH ?? "").trim().toLowerCase();
    if (!admin || !codeHash) {
      return { ok: false as const, error: "La connexion par code n'est pas configurée dans Convex." };
    }
    if (!(await hitRateLimit(ctx, "login-code", 5, 15 * 60 * 1000))) {
      return { ok: false as const, error: "Trop d'essais. Réessayez dans 15 minutes." };
    }
    const emailOk = email.trim().toLowerCase() === admin;
    const codeOk = (await sha256(code.trim())) === codeHash;
    if (!emailOk || !codeOk) {
      return { ok: false as const, error: "Email ou code incorrect." };
    }
    return { ok: true as const, token: await createSession(ctx) };
  },
});

async function createSession(ctx: MutationCtx) {
  // Nettoyage des sessions expirées
  for (const s of await ctx.db.query("sessions").collect()) {
    if (s.expiresAt < Date.now()) await ctx.db.delete(s._id);
  }
  const token = randomHex(32);
  await ctx.db.insert("sessions", {
    tokenHash: await sha256(token),
    expiresAt: Date.now() + SESSION_TTL,
  });
  return token;
}

export const isValid = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token) return false;
    const tokenHash = await sha256(token);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    return Boolean(session && session.expiresAt > Date.now());
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256(token);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});
