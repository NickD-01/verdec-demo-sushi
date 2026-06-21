# SETUP — Nieuwe klant onboarden

Volg deze stappen om het platform in te stellen voor een nieuwe zaak.
Geschatte tijd: **30–60 minuten**.

---

## Stap 1 — Repo aanmaken

1. Ga naar [github.com/verdec/verdec-template](https://github.com) → **Use this template** → **Create a new repository**
2. Naam: `naam-van-zaak` (bv. `frituur-de-fritzak` of `mang-mang`)
3. Clone lokaal:
   ```
   git clone https://github.com/jouw-org/naam-van-zaak.git
   cd naam-van-zaak
   ```

---

## Stap 2 — Kleuren aanpassen

Open [`tailwind.config.ts`](tailwind.config.ts) en pas de `verdec`-tokens aan:

```ts
verdec: {
  yellow: "#F5C518",  // ← primaire accentkleur (knop, badge)
  black:  "#0A0A0A",  // ← donkere achtergrond (hero)
  dark:   "#1A1A1A",  // ← secundaire donkere tint
},
```

En pas de primaire CSS-kleur aan in [`app/globals.css`](app/globals.css):

```css
--primary: 45 93% 53%;  /* ← HSL van de accentkleur */
```

> **Tip:** gebruik een kleurpicker op het logo van de klant om de hex te vinden,
> zet die in een HSL-converter voor `globals.css`.

---

## Stap 3 — Restaurantinfo invullen

Open [`prisma/seed.ts`](prisma/seed.ts). Zoek naar `// TODO:` en pas aan:

| Veld | Uitleg |
|------|--------|
| `restaurantName` | Naam die klanten zien |
| `phone` | Telefoonnummer |
| `address` | Straat, postcode gemeente |
| `openingHours` | Vrije tekst (bv. "Di-zo: 17:00 - 21:30") |
| `tagline` | Korte slogan op homepage |
| `openTime` / `closeTime` | HH:MM — bepaalt wanneer bestellen mogelijk is |
| `maxOrdersPerSlot` | Max bestellingen per 15-min tijdslot |

---

## Stap 4 — Categorieën, producten en sauzen

Pas de arrays in `prisma/seed.ts` aan:

- **`categories`**: voeg categorieën toe (bv. Voorgerechten, Hoofdgerechten, Dranken)
- **`sauces`**: voeg de sauzen en/of kruiden van de zaak toe
- **`products`**: voeg alle producten toe met naam, prijs en categorie-slug

Producten kunnen na livegang ook via het admin-panel worden beheerd.

---

## Stap 5 — Foto's invullen

Open [`lib/images.ts`](lib/images.ts).

**Optie A — Unsplash (snel voor demo)**
Zoek op [unsplash.com](https://unsplash.com) naar het gerecht, kopieer de foto-ID uit de URL
(`photo-xxxxxxxxxxxxxxx`) en vul die in:

```ts
food1: u("photo-1568901346375-23c9450c58cd"),
```

**Optie B — eigen foto's (voor productie)**
- Zet foto's in `public/images/` (bv. `public/images/product1.jpg`)
- Gebruik als waarde: `"/images/product1.jpg"`

> Na livegang kan de klant foto's ook via het admin-panel aanpassen (Admin → Menu → product bewerken).

---

## Stap 6 — Metadata aanpassen

Open [`app/layout.tsx`](app/layout.tsx) en vervang alle `Restaurant Naam`-vermeldingen door de echte naam.

---

## Stap 7 — Omgevingsvariabelen instellen

```bash
copy .env.example .env
```

Bewerk `.env`:

```env
NEXTAUTH_SECRET=genereer-met-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Admin-login (wijzig vóór livegang!)
ADMIN_EMAIL=owner@dezaak.be
ADMIN_PASSWORD=SterkWachtwoord123!

DATABASE_URL="file:./dev.db"
```

> Gebruik `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` om `NEXTAUTH_SECRET` te genereren.

---

## Stap 8 — Database opzetten en seed draaien

```bash
npm install
npm run db:setup
```

Dit doet: `prisma generate` → `prisma db push` → `prisma db seed`

---

## Stap 9 — Testen

```bash
npm run build
npm start
```

| Pagina | URL |
|--------|-----|
| Klantensite | http://localhost:3000 |
| Menu | http://localhost:3000/menu |
| Admin login | http://localhost:3000/admin/login |

Controleer:
- [ ] Correcte naam en kleuren op de homepage
- [ ] Alle categorieën en producten zichtbaar in het menu
- [ ] Sauzen zichtbaar bij producten met `allowsSauceCustomization: true`
- [ ] Bestelling plaatsen werkt van begin tot eind
- [ ] Admin-login werkt met het ingestelde wachtwoord
- [ ] Bestellingen komen binnen in admin → Bestellingen

---

## Stap 10 — Vóór livegang

- [ ] `ADMIN_EMAIL` en `ADMIN_PASSWORD` ingesteld op iets sterk (niet `admin123`)
- [ ] Echte foto's in plaats van Unsplash-placeholders
- [ ] Betalingsintegratie geconfigureerd (Mollie API-key in `.env`)
- [ ] Domeinnaam ingesteld en `NEXTAUTH_URL` bijgewerkt
- [ ] `npm run build` slaagt zonder fouten

---

## Veelgestelde vragen

**Hoe voeg ik later producten toe?**  
Admin-panel → Menu → knop "Product toevoegen". Geen code nodig.

**Hoe pas ik de openingstijden aan?**  
Admin-panel → Instellingen. Wordt direct opgeslagen in de database.

**Sauzen werken niet?**  
Controleer of het product `allowsSauceCustomization: true` heeft in de seed, én of er sauzen gekoppeld zijn (Admin → Sauzen & kruiden → product koppelen).

**Hoe maak ik een tweede klant aan?**  
Herhaal stap 1 → maak een nieuw repository vanuit de template.
