# Lanceergids — Verdec live zetten voor echte klanten

Deze gids beschrijft hoe je het project van **lokale demo** naar een **productieomgeving** brengt voor een echte frituur.

---

## Overzicht

| Fase | Doel |
|------|------|
| 1. Voorbereiding | Domein, hosting, database, secrets |
| 2. Database | PostgreSQL (aanbevolen) + schema + eerste data |
| 3. Deploy | Next.js app online |
| 4. Inrichting | Menu, foto's, wachtwoord, instellingen |
| 5. Go-live | Testbestelling, monitoring |

Geschatte kosten op free tiers: **€0–10/maand** voor een kleine zaak.

---

## 1. Voorbereiding

### Wat je nodig hebt

- GitHub-repository met dit project
- Domein (bv. `bestel.jouwfrituur.be`) — optioneel in begin met `*.vercel.app`
- E-mailadres voor admin-login
- Lijst producten, prijzen, openingsuren
- Productfoto's (JPG/PNG, liefst &lt; 500 KB per foto)

### Wat je **niet** mag doen in productie

- Standaardwachtwoord `admin123` laten staan
- `npm run db:seed` op een database met echte bestellingen (overschrijft demo-data)
- SQLite op Vercel/serverless hosten
- Demo-banner laten staan (optioneel verwijderen, zie onder)

---

## 2. Database opstarten

### Optie A — Lokaal ontwikkelen (SQLite)

Geschikt alleen voor **ontwikkeling op je PC**.

```bash
# In projectmap
copy .env.example .env
```

`.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="lokaal-geheim-min-32-tekens-lang-xyz123"
```

Database aanmaken en vullen:

```bash
npm install
npm run db:setup
```

Dit maakt `prisma/dev.db` en laadt demo-menu + admin-gebruiker.

**Alleen schema bijwerken** (zonder seed):

```bash
npm run db:generate
npm run db:push
```

**Opnieuw demo-data** (⚠️ wist demo-menu/orders):

```bash
npm run db:seed
```

### Optie B — Productie (PostgreSQL via Neon) — aanbevolen

1. Maak account op [neon.tech](https://neon.tech)
2. Nieuw project → kopieer **connection string**
3. Pas `prisma/schema.prisma` aan:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Zet in productie-`.env`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

5. Eerste keer op je PC (met productie-URL in `.env`):

```bash
npm run db:generate
npx prisma db push
npm run db:seed
```

Daarna **seed niet meer** op productie tenzij je bewust alles reset.

### Database-commando's — snelreferentie

| Situatie | Commando's |
|----------|------------|
| Eerste installatie lokaal | `npm run db:setup` |
| Schema gewijzigd | `npm run db:generate` → `npm run db:push` |
| Prisma client fout (Windows) | Dev-server stoppen → `npm run db:generate` |
| Alleen admin/menu resetten | `npm run db:seed` (⚠️ destructief voor demo-data) |

---

## 3. Omgevingsvariabelen (productie)

Maak een sterk geheim (min. 32 tekens), bv. met PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

| Variabele | Voorbeeld | Verplicht |
|-----------|-----------|-----------|
| `DATABASE_URL` | `postgresql://...` | Ja |
| `NEXTAUTH_URL` | `https://bestel.jouwfrituur.be` | Ja |
| `NEXTAUTH_SECRET` | (random string) | Ja |

Zet deze in je hosting dashboard (Vercel → Settings → Environment Variables).

---

## 4. Deploy (Vercel + Neon)

### Stap 1 — Code op GitHub

Push de repository naar GitHub.

### Stap 2 — Vercel project

1. [vercel.com](https://vercel.com) → Import project
2. Framework: **Next.js** (automatisch)
3. Environment variables invullen (zie §3)
4. Deploy

### Stap 3 — Build settings

Standaard:

- Build: `npm run build`
- Output: Next.js default

Voeg **geen** `postinstall: prisma generate` toe als dat EPERM geeft; Vercel voert generate meestal tijdens build uit. Zo niet, in project settings:

```bash
npm run db:generate && npm run build
```

### Stap 4 — Na eerste deploy

1. Controleer admin-login
2. Wijzig wachtwoord (zie §5)
3. Verwijder of pas demo-banner aan
4. Plaats testbestelling

### Alternatieven voor SQLite-vriendelijke hosting

| Platform | SQLite | Opmerking |
|----------|--------|-----------|
| Railway | Ja (volume) | Eenvoudig, ~$5/maand |
| Render | Ja (disk) | Free tier slaapt in |
| Fly.io | Ja (volume) | Iets technischer |

Voor deze platforms: zelfde `.env`, `npm run build` + `npm start`, persistent volume op `prisma/dev.db`.

---

## 5. Inrichting voor de klant

### Admin-wachtwoord wijzigen

Standaard na seed: `owner@verdec.be` / `admin123`.

**Tijdelijk (tot wachtwoord-reset in app bestaat):**

1. Genereer hash lokaal of pas seed aan en draai alleen user-update
2. Of: nieuwe user via Prisma Studio:

```bash
npx prisma studio
```

3. Tabel `User` → wachtwoordveld is bcrypt-hash

Veiliger: pas `prisma/seed.ts` aan met nieuw wachtwoord, deploy, run seed **alleen op lege DB**.

### Restaurantinstellingen

**Admin → Instellingen**

- Naam, telefoon, adres, slogan, openingsuren
- Afhaalcapaciteit: min. wachttijd, slot-interval, max. bestellingen per slot, open/sluit

### Menu & foto's

**Admin → Menubeheer**

- Product toevoegen/bewerken
- **Afbeelding**: `/images/placeholder-food.svg` of eigen bestand in `public/images/`
  - Upload foto naar `public/images/product-naam.jpg`
  - Vul in: `/images/product-naam.jpg`
- **Extra's**: kruiden + sauzen per product kiezen

**Admin → Sauzen & kruiden**

- Kruiden: zout, peper, … (geen foto nodig)
- Sauzen: mayo, curry, … (emoji of `/images/sauces/...`)

### Demo-banner verwijderen (optioneel)

Verwijder of comment uit in `app/(customer)/layout.tsx`:

```tsx
import { DemoBanner } from "@/components/layout/demo-banner";
// en <DemoBanner /> in de layout
```

---

## 6. Testen vóór go-live

### Klantflow

- [ ] Menu laadt, zoeken werkt vanaf 1 letter
- [ ] Product zonder extra's → winkelwagen
- [ ] Friet met extra's → kruiden (niet met én zonder zout), sauzen optioneel
- [ ] Afrekenen met naam, telefoon, tijdslot
- [ ] Bevestigingspagina met bestelnummer
- [ ] Niet-beschikbaar product kan niet besteld worden

### Adminflow

- [ ] Bestelling verschijnt in Bestellingen + Keuken
- [ ] Status wijzigen (Starten → Klaar → Afgehaald)
- [ ] Menu-wijziging zichtbaar op klantensite
- [ ] Instellingen opgeslagen na refresh

### Technisch

- [ ] `npm run build` slaagt lokaal
- [ ] HTTPS actief op productie-URL
- [ ] `NEXTAUTH_URL` = exacte productie-URL (geen trailing slash)

---

## 7. Onderhoud

### Dagelijks

- Bestellingen afhandelen via admin/keuken

### Wekelijks

- Controleer of populaire producten nog `Beschikbaar` zijn
- Backup database (Neon heeft point-in-time op betaalde tiers)

### Bij code-update

```bash
git pull
npm install
npm run db:generate
npx prisma db push   # alleen als schema gewijzigd
npm run build
# redeploy op Vercel (automatisch bij push naar main)
```

### Problemen

| Symptoom | Actie |
|----------|--------|
| 404 JS-bestanden | `.next` wissen, één dev-server, hard refresh |
| Bestellingen verdwijnen | Waarschijnlijk SQLite op serverless → PostgreSQL |
| Foto's laden niet | Controleer pad `/images/...` of URL; geen kapotte Unsplash-links |
| EPERM prisma | Dev-server stoppen, opnieuw generate |

---

## 8. Optionele verbeteringen (later)

- E-mail/SMS bij nieuwe bestelling
- Wachtwoord wijzigen in admin
- Eigen domein + SSL (Vercel automatisch)
- GDPR-privacyverklaring
- Rate limiting op `/api/orders`
- Automatische tests in CI

---

## Snelle start-checklist (copy-paste)

```text
[ ] .env met DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
[ ] prisma provider = postgresql (productie)
[ ] npm run db:setup (eerste keer) of db push (update)
[ ] Deploy Vercel + env vars
[ ] Admin-login + wachtwoord wijzigen
[ ] Instellingen invullen
[ ] Menu + echte foto's
[ ] Sauzen/kruiden controleren
[ ] Testbestelling
[ ] Demo-banner uit (optioneel)
[ ] Klant-URL delen
```

---

Vragen of fouten tijdens deploy? Controleer eerst de [README](../README.md) en de build-log op Vercel.
