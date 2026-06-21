# Verdec Afhaalplatform

MVP voor Belgische frituur — klantensite (menu, winkelwagen, afhalen) + admin (bestellingen, keuken, menu, sauzen & kruiden).

## Functies

- **Klant**: menu met zoeken, producten met kruiden (checkbox) en sauzen (optioneel), winkelwagen, afhaaltijden
- **Admin**: bestellingen, keukenscherm, menubeheer, aparte sauzen/kruiden, instellingen, analyse
- **Demo-data**: seed met menu, bestellingen en standaard login

## Snel starten (lokaal)

### Makkelijkste manier (Windows)

**Dubbelklik** op `start.bat` in de projectmap — of in de terminal:

```bash
npm run go
```

Dit script: maakt `.env` aan indien nodig, installeert dependencies, **bereidt altijd de database voor** (`prisma generate` + `db push`), laadt demo-data alleen de eerste keer (of met `npm run go -- -seed`), stopt oude servers, wist `.next`, start `npm run dev`.

| Wat | URL |
|-----|-----|
| Menu | http://localhost:3000/menu |
| Admin | http://localhost:3000/admin/login |
| Login | `owner@verdec.be` / `admin123` |

**Verkoop / prijs inschatting:** zie [docs/VERKOOP.md](docs/VERKOOP.md).

---

### Handmatig (stap voor stap)

### 1. Vereisten

- Node.js 18+
- npm

### 2. Omgevingsvariabelen

```bash
copy .env.example .env
```

Pas minstens `DATABASE_URL` aan (standaard SQLite in `prisma/dev.db`).

### 3. Database opstarten

```bash
npm install
npm run db:setup
```

Dit doet: `prisma generate` → `prisma db push` → `db:seed`.

**Melding over kolom `asksForSalt`?** Die oude kolom is vervangen door kruiden/extra's. `npm run go` past het schema automatisch aan (`--accept-data-loss`).

**Windows EPERM bij `prisma generate`?** Stop eerst `npm run dev`, daarna:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Development server

```bash
npm run dev
```

| Wat | URL |
|-----|-----|
| Shop | http://localhost:3000 |
| Menu | http://localhost:3000/menu |
| Admin | http://localhost:3000/admin/login |

**Demo-login:** `owner@verdec.be` / `admin123` — wijzig dit vóór productie (zie [docs/LANCEERGIDS.md](docs/LANCEERGIDS.md)).

## Scripts

| Commando | Beschrijving |
|----------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Productie-build |
| `npm start` | Productie-server (na build) |
| `npm run db:generate` | Prisma client genereren |
| `npm run db:push` | Schema naar database |
| `npm run db:seed` | Demo-data laden (**overschrijft** demo-menu/orders) |
| `npm run db:setup` | generate + push + seed |

## Productfoto's

Standaard gebruikt het project **lokale placeholders** (`/images/placeholder-food.svg`) — geen externe Unsplash-URL's meer.

Vervang per product in **Admin → Menubeheer** het veld *Afbeelding* door:

- een pad in `public/`, bv. `/images/mijn-friet.jpg`, of
- een stabiele HTTPS-URL naar je eigen hosting.

## Extra's (kruiden & sauzen)

- **Kruiden** (zout, peper, …): checkboxes; met/zonder zout zijn wederzijds exclusief.
- **Sauzen**: optioneel grid met icoon/foto.
- Per product: schakel *Extra's* in bij menubeheer en kies apart kruiden en sauzen.
- Beheer alle opties onder **Admin → Sauzen & kruiden**.

## Tech stack

Next.js 14 · TypeScript · Tailwind · shadcn/ui · Prisma · SQLite (lokaal) · NextAuth

## Data & persistentie

| Onderdeel | Opslag |
|-----------|--------|
| Menu, bestellingen, instellingen | SQLite `prisma/dev.db` (lokaal) |
| Winkelwagen klant | `localStorage` in browser |

Wijzigingen in admin blijven bewaard na herstart. **Niet** `db:seed` draaien op een live database met echte data.

## Productie

**Gebruik geen SQLite op Vercel** (geen persistent schijf).

Volledige stappen voor echte klanten: **[docs/LANCEERGIDS.md](docs/LANCEERGIDS.md)** (PostgreSQL, env vars, wachtwoord, checklist).

## Problemen oplossen

| Probleem | Oplossing |
|----------|-----------|
| 404 op `main.js` / `_app.js` | Stop alle `npm run dev`, verwijder `.next`, start één dev-server op poort 3000 |
| EPERM prisma generate | Dev-server stoppen, opnieuw `npm run db:generate` |
| Lege productfoto's | Zet eigen afbeelding in admin of gebruik `/images/placeholder-food.svg` |

## Licentie

Proprietary — Verdec Afhaalplatform MVP.
