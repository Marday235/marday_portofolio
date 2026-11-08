# Portfolio Marday 235 — v2

Portfolio d'**Abdoulaye Wardougou** (Développeur Full Stack · Marday 235).
Site bilingue FR/EN + espace admin privé (`/admin`).

**Stack :** React 19 · TypeScript · Vite · Tailwind 4 · Convex · GSAP · Motion · Cloudflare Workers · Lumail · Turnstile

---

## 1. Démarrer en local (5 minutes)

```bash
npm install
npx convex dev          # 1re fois : connectez-vous, créez le projet "marday235"
```

`npx convex dev` crée le fichier `.env.local` (avec `VITE_CONVEX_URL`) et reste ouvert.
Dans **un deuxième terminal** :

```bash
npx convex env set ADMIN_EMAIL marday235@gmail.com
npm run seed            # charge le contenu de départ (projets, compétences, parcours)
npm run dev             # http://localhost:5173
```

### Se connecter à l'admin
1. Ouvrez http://localhost:5173/admin et entrez `marday235@gmail.com`.
2. **Tant que Lumail n'est pas configuré**, le code n'est pas envoyé par email :
   il s'affiche dans le terminal de `npx convex dev` (ligne `[CODE ADMIN] 123456`)
   et dans le dashboard Convex → **Logs**.
3. Entrez le code → vous êtes connecté pour 30 jours.

---

## 2. Variables d'environnement

### Côté Convex (`npx convex env set NOM valeur`, à faire aussi en prod avec `--prod`)

| Variable | Rôle | Obligatoire |
|---|---|---|
| `ADMIN_EMAIL` | La seule adresse autorisée à se connecter | ✅ |
| `LUMAIL_API_KEY` | Jeton Lumail `lum_...` (page API tokens) | pour les emails |
| `LUMAIL_FROM` | Expéditeur vérifié, ex. `Marday 235 <contact@marday235.com>` | pour les emails |
| `TURNSTILE_SECRET_KEY` | Clé secrète Cloudflare Turnstile | anti-spam |

### Côté site (`.env.local` en local, `.env.production` pour le build)

| Variable | Rôle |
|---|---|
| `VITE_CONVEX_URL` | Écrite automatiquement par Convex |
| `VITE_SITE_URL` | URL publique, pour l'aperçu WhatsApp/Facebook |
| `VITE_TURNSTILE_SITE_KEY` | Clé publique Turnstile |
| `VITE_CF_ANALYTICS_TOKEN` | Jeton Cloudflare Web Analytics |

Sans Lumail ni Turnstile, **tout fonctionne quand même** : les messages arrivent dans l'admin, les codes de connexion sont dans les logs Convex, et le formulaire n'a simplement pas de vérification anti-robot.

---

## 3. Mettre en ligne (Cloudflare Workers)

```bash
npx wrangler login       # une seule fois
npx convex env set ADMIN_EMAIL marday235@gmail.com --prod
npm run deploy
npx convex run admin:seedInit --prod   # une seule fois, pour le contenu de départ
```

`npm run deploy` publie le backend Convex de production, construit le site avec la bonne URL, puis l'envoie sur Cloudflare.
Le site est alors sur **https://marday235.mardaywardougou9.workers.dev**.

### Brancher le domaine marday235.com
1. Achetez `marday235.com` dans Cloudflare (Domain Registration).
2. Cloudflare → Workers & Pages → `marday235` → Settings → **Domains & Routes** → Add → Custom domain → `marday235.com`.
3. Mettez `VITE_SITE_URL=https://marday235.com` dans `.env.production` puis `npm run deploy`.

### Activer l'email avec Lumail
1. Lumail → Settings → Domains → ajoutez `marday235.com` et suivez la config SPF/DKIM/DMARC (guidée, dans Cloudflare DNS).
2. Créez un jeton API, puis :
   ```bash
   npx convex env set LUMAIL_API_KEY lum_xxx --prod
   npx convex env set LUMAIL_FROM "Marday 235 <contact@marday235.com>" --prod
   ```
3. Chaque message du formulaire vous est envoyé par email **et** la personne est ajoutée dans Lumail avec le tag `portfolio-contact`.

### Activer l'anti-spam Turnstile
1. Cloudflare → Turnstile → Add widget → domaine `marday235.com` (+ `marday235.mardaywardougou9.workers.dev`).
2. `npx convex env set TURNSTILE_SECRET_KEY 0x... --prod`
3. Ajoutez `VITE_TURNSTILE_SITE_KEY=0x...` dans `.env.production`, puis `npm run deploy`.

### Statistiques de visites
Cloudflare → Analytics & Logs → Web Analytics → Add site → copiez le `token` du snippet → `VITE_CF_ANALYTICS_TOKEN=...` dans `.env.production` → `npm run deploy`.

---

## 4. À faire dans l'admin après la mise en ligne

- [ ] **Réglages** : numéro WhatsApp, vrais chiffres, LinkedIn, CV FR et EN (PDF)
- [ ] **Projets** : ajouter 3 à 5 captures pour ASEEST/D et SoukTchad (le site affiche un visuel provisoire en attendant)
- [ ] **Parcours** : remplacer l'exemple par vos vraies études et expériences
- [ ] **Compétences** : retirer ce que vous ne pratiquez pas
- [ ] **Témoignages** : la section apparaît dès le premier témoignage visible

---

## 5. Structure

```
convex/            Backend (base de données + fonctions)
  schema.ts        Tables : projets, parcours, compétences, témoignages, réglages, messages
  public.ts        Ce que le site affiche
  admin.ts         Fonctions de l'admin (protégées par session)
  auth.ts          Connexion par code email
  contact.ts       Formulaire de contact (Turnstile + limite + Lumail)
  lumail.ts        Client API Lumail v2
  seedData.ts      Contenu de départ
  backend.test.ts  Tests (npm test)
src/
  pages/           Accueil, page projet, 404
  components/site/ Sections du site
  admin/           Espace admin (chargé seulement sur /admin)
  lib/i18n.tsx     Tous les textes FR/EN de l'interface
public/            Photo, images des mini-jeux, aperçu de partage (og.jpg)
```

## Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Site en local |
| `npx convex dev` | Backend en local (à laisser ouvert) |
| `npm test` | Tests du backend |
| `npm run build` | Vérifie les types et construit le site |
| `npm run deploy` | Met tout en ligne |
