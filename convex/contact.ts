import { v, ConvexError } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { adminEmail, escapeHtml, hitRateLimit } from "./lib";
import { addSubscriber, sendEmail } from "./lumail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile pas encore configuré
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

/** Formulaire de contact public. */
export const send = action({
  args: {
    name: v.string(),
    email: v.string(),
    body: v.string(),
    lang: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const body = args.body.trim();
    if (name.length < 2 || name.length > 100) throw new ConvexError("invalid_name");
    if (!EMAIL_RE.test(email) || email.length > 200) throw new ConvexError("invalid_email");
    if (body.length < 10 || body.length > 5000) throw new ConvexError("invalid_body");

    if (!(await verifyTurnstile(args.turnstileToken))) {
      throw new ConvexError("captcha");
    }

    const stored = await ctx.runMutation(internal.contact.store, {
      name,
      email,
      body,
      lang: args.lang === "en" ? "en" : "fr",
    });
    if (!stored) throw new ConvexError("rate_limit");

    // Les notifications ne doivent jamais faire échouer l'envoi du message.
    try {
      const admin = adminEmail();
      if (admin) {
        await sendEmail(
          admin,
          `Nouveau message de ${name} (portfolio)`,
          `<div style="font-family:sans-serif;font-size:15px">
            <p><b>${escapeHtml(name)}</b> &lt;${escapeHtml(email)}&gt; vous a écrit :</p>
            <blockquote style="border-left:3px solid #FECB00;padding-left:12px;white-space:pre-wrap">${escapeHtml(body)}</blockquote>
            <p>Répondez directement à ${escapeHtml(email)} ou ouvrez /admin.</p>
          </div>`,
        );
      }
      await addSubscriber(email, name, ["portfolio-contact"]);
    } catch (e) {
      console.error("Notification échouée", e);
    }
    return { ok: true };
  },
});

export const store = internalMutation({
  args: { name: v.string(), email: v.string(), body: v.string(), lang: v.string() },
  handler: async (ctx, args) => {
    const hour = 60 * 60 * 1000;
    if (!(await hitRateLimit(ctx, `contact:${args.email}`, 3, hour))) return false;
    if (!(await hitRateLimit(ctx, "contact:global", 30, hour))) return false;
    await ctx.db.insert("messages", { ...args, read: false });
    return true;
  },
});
