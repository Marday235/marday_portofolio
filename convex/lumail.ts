/**
 * Petit client pour l'API Lumail v2 (https://lumail.io/docs/api-reference/v2).
 * Variables d'environnement Convex :
 *   LUMAIL_API_KEY  — jeton "lum_..."
 *   LUMAIL_FROM     — expéditeur vérifié, ex. "Marday 235 <contact@marday235.com>"
 * Sans ces variables, les emails ne partent pas : ils sont écrits dans les logs Convex.
 */
const BASE = "https://lumail.io/api/v2";

export function lumailConfigured(): boolean {
  return Boolean(process.env.LUMAIL_API_KEY && process.env.LUMAIL_FROM);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!lumailConfigured()) {
    console.log(`[email non envoyé — Lumail non configuré] À: ${to} | ${subject}\n${html}`);
    return false;
  }
  const res = await fetch(`${BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LUMAIL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.LUMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    console.error(`Lumail /emails ${res.status}: ${await res.text()}`);
    return false;
  }
  return true;
}

export async function addSubscriber(email: string, name: string, tags: string[]): Promise<void> {
  if (!process.env.LUMAIL_API_KEY) return;
  const res = await fetch(`${BASE}/subscribers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LUMAIL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, tags }),
  });
  if (!res.ok) console.error(`Lumail /subscribers ${res.status}: ${await res.text()}`);
}
