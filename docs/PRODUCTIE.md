# Productie- & security-checklist

Deze checklist breng je van **demo** naar een **veilige, altijd-online** installatie voor één klant. Vink alles af vóór livegang.

> Korte versie: demo = veilig opgezet maar draait op SQLite met gesimuleerde betaling. Productie = PostgreSQL + Mollie + eigen secrets + monitoring.

---

## 1. Secrets & omgeving (`.env`)

| Variabele | Demo | Productie |
|-----------|------|-----------|
| `NEXTAUTH_SECRET` | gegenereerd | **eigen** waarde, min. 32 tekens — `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://jouwdomein.be` |
| `APP_BASE_URL` | `http://localhost:3000` | `https://jouwdomein.be` |
| `DATABASE_URL` | SQLite | **PostgreSQL** (Neon/Supabase), `sslmode=require` |
| `MOLLIE_API_KEY` | leeg (demo) | `live_...` (of `test_...` om te testen) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `owner@verdec.be` / `admin123` | **uniek e-mailadres + sterk wachtwoord** |

- [ ] `.env` staat in `.gitignore` (✓ al zo) — commit nooit secrets
- [ ] Secrets staan in de hosting-omgeving (Vercel/Railway env vars), niet in code

---

## 2. Database

- [ ] Wissel SQLite → PostgreSQL in `prisma/schema.prisma` (`provider = "postgresql"`)
- [ ] `npx prisma db push` (of migraties) op de productie-DB
- [ ] `npx tsx prisma/seed.ts` één keer (zet admin + menu) — daarna admin-wachtwoord via env
- [ ] Dagelijkse **backup** ingeschakeld (Neon/Supabase doen dit automatisch)

> SQLite kan geen meerdere instances / hoge gelijktijdigheid aan en is dus niet geschikt voor "altijd online".

---

## 3. Betaling (Mollie)

De code is productieklaar; je hoeft enkel te configureren:

- [ ] Mollie-account + **organisatie geverifieerd** (KBO-nummer vereist)
- [ ] `MOLLIE_API_KEY` ingevuld → demo-knop "Betaling simuleren" verdwijnt automatisch
- [ ] Webhook bereikbaar op `https://jouwdomein.be/api/payments/webhook` (Mollie kan localhost niet bereiken)
- [ ] Testbetaling met `test_...`-key end-to-end: bestellen → Mollie → terug → status **Betaald** in admin

**Beveiliging is al ingebouwd:** de webhook leest nooit de status uit de request-body, maar haalt die geauthenticeerd op bij Mollie (`lib/mollie.ts`). De demo-route `/api/orders/[id]/pay` is automatisch geblokkeerd zodra een Mollie-key aanwezig is.

---

## 4. Security (reeds in de code)

- [x] Admin-API's achter `requireAuth` (instellingen, producten, sauzen, orders wijzigen/verwijderen)
- [x] Publieke order-GET geeft **geen** klant-PII terug (naam/telefoon enkel voor ingelogde admin)
- [x] Input-validatie met Zod op alle externe input; prijzen server-side herberekend
- [x] Wachtwoorden gehasht met bcrypt
- [x] Security headers (`next.config.mjs`): HSTS, X-Frame-Options, nosniff, Referrer-Policy
- [x] Rate-limiting op bestellen, betalen en login (brute-force-rem)

### Nog te doen vóór echte livegang
- [ ] **Next.js 15-upgrade** — 14.2.35 lost de kritieke lekken op, maar enkele DoS-advisories zijn pas in v15 gepatcht. Plan deze migratie (async `params`). Hosting met CDN/WAF (Vercel/Cloudflare) vangt de meeste DoS sowieso op.
- [ ] Rate-limiting naar **Upstash/Redis** als je op meerdere instances draait (huidige limiter is per-instance in-memory)
- [ ] GDPR: privacyverklaring + bewaartermijn klantgegevens (naam/telefoon van orders)
- [ ] Dev-tooling-kwetsbaarheden (vitest/eslint) updaten — raken alleen development, niet productie

---

## 5. Hosting & altijd online

| Onderdeel | Aanrader |
|-----------|----------|
| Hosting | Vercel of Railway (auto-HTTPS, auto-restart, deploy op `git push`) |
| Database | Neon of Supabase (managed Postgres + backups) |
| Domein | eigen domein van de klant, SSL automatisch |
| Uptime-alarm | UptimeRobot / Better Stack → mail/SMS bij downtime |
| Foutmonitoring | Sentry (`@sentry/nextjs`) |

- [ ] Health-check `GET /api/health` toegevoegd aan uptime-monitor

---

## 6. Laatste check vóór oplevering

- [ ] Demo-banner uit (component `demo-banner`)
- [ ] Echte productfoto's i.p.v. placeholders
- [ ] Echte menu, prijzen, openingsuren, restaurantnaam in admin → instellingen
- [ ] Admin-wachtwoord gewijzigd
- [ ] Testbestelling + testbetaling end-to-end op het echte domein
- [ ] Schriftelijke afspraak: wat zit in de prijs (hosting, support, updates)
