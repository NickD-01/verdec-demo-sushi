# Verkoopprijs — richtlijnen voor dit product

Dit document helpt je een **realistische prijs** te bepalen wanneer je dit platform verkoopt aan een frituur (eenmalig + optioneel onderhoud).

> Geen juridisch of fiscaal advies — pas aan op basis van je markt, regio en wat je precies levert.

---

## Wat je nu verkoopt (eerlijk beeld)

| Niveau | Beschrijving |
|--------|----------------|
| **Nu (demo / bijna klaar)** | Werkend MVP lokaal, NL UI, admin, extras, zoeken — nog geen productie-hardening |
| **Afgewerkt product** | Live op eigen domein, PostgreSQL, sterk wachtwoord, echte foto’s, 1–2 uur training, 30 dagen bugfix |
| **Premium** | Bovenstaand + e-mail bij bestelling, betaling online, GDPR-pagina, SLA, maandelijks onderhoud |

---

## Prijsmodellen

### 1. Eenmalig project (meest gebruikelijk bij frituur)

Klant betaalt **setup + oplevering**. Jij host of klant host.

| Pakket | Wat zit erin | Richtprijs BE/NL (2025–2026) |
|--------|----------------|------------------------------|
| **Starter** | Deploy, menu invullen (tot ~30 producten), logo/kleuren, training 1u | **€1.500 – €2.500** |
| **Standaard** | Starter + sauzen/kruiden, keukenscherm, afhaalslots, eigen domein | **€2.500 – €4.500** |
| **Pro** | Standaard + online betaling (Mollie/Stripe), mailnotificaties, privacypagina | **€4.500 – €7.500** |

### 2. Maandelijks (SaaS / verhuur)

Klant betaalt per maand; jij blijft hosten en updaten.

| Formule | Richtprijs |
|---------|------------|
| Alleen hosting + kleine updates | **€49 – €99 / maand** |
| Hosting + support (reactie binnen 48u) | **€99 – €199 / maand** |
| Met piek-support (vrijdagavond) | **€150 – €250 / maand** |

*Vergelijk: losse bestel-app abonnementen of “website + bestellen” bij agencies zitten vaak **€80–300/maand**.*

### 3. Hybride (aanbevolen voor frituur)

| Onderdeel | Richtprijs |
|-----------|------------|
| Eenmalige setup | **€2.000 – €3.500** |
| Maandelijks (hosting + onderhoud) | **€75 – €150 / maand** |
| Optioneel: extra uur training/content | **€75 – €125 / uur** |

---

## Factoren die je prijs omhoog trekken

- Eigen huisstijl, professionele productfoto’s (jij regelt of onderaannemer)
- Koppeling kassasysteem / boekhouding
- Meertalig (NL + FR in Vlaanderen)
- Hoge beschikbaarheid (“moet altijd werken op zaterdag”)
- Snelle support SLA

## Factoren die je prijs omlaag halen

- Klant vult zelf menu in
- Alleen demo/MVP zonder productie-garantie
- Geen betalingen in app (alleen afhalen + contant/kaart aan toonbank)
- Concurrentie met goedkope WordPress-template (€500 eenmalig)

---

## Praktisch voorbeeld: “afgewerkt” voor één zaak

**Scenario:** Frituur in Vlaanderen, ~40 producten, afhaal only, jij zet live op Vercel + Neon, 1u training, 2 weken bugfixes.

| Post | Bedrag |
|------|--------|
| Ontwikkeling / oplevering (forfait) | €2.800 |
| Domein + eerste jaar hosting (doorrekken of inbegrepen) | €0 – €120 |
| **Totaal eenmalig** | **~€2.800 – €3.200** |
| Onderhoud (optioneel) | €99/maand |

Als **junior/freelancer zonder portfolio**: start rond **€1.800 – €2.200** voor eerste klant (referentie bouwen).

Als **agency of met bewezen omzet voor klant**: **€4.000+** is verdedigbaar met betalingen + support.

---

## Wat je klant moet begrijpen (verkoopargument)

- Geen commissie per bestelling (i.t.t. Deliveroo/Thuisbezorgd)
- Eigen merk, eigen klantgegevens
- Eén vast bedrag i.p.v. 15–30% commissie op elke order

**ROI-voorbeeld:** bij 200 bestellingen/maand à €15 gemiddeld = €3.000 omzet. Commissie 25% = €750/maand weg. Jouw **€99/maand** of **€2.500 eenmalig** is snel terugverdiend.

---

## Checklist vóór je “afgewerkt” verkoopt

- [ ] Live op HTTPS met PostgreSQL
- [ ] Admin-wachtwoord gewijzigd
- [ ] Demo-banner uit
- [ ] Echte foto’s en prijzen
- [ ] Testbestelling end-to-end
- [ ] Schriftelijke afspraak: wat zit wel/niet in prijs (hosting, support, extra’s)
- [ ] Eigendom: domein van klant, code/repo van jou of overdracht vastgelegd

---

## Samenvatting

| Vraag | Antwoord |
|-------|----------|
| Minimum voor serieuze frituur? | **~€2.000 eenmalig** of **~€75/maand** |
| Redelijk als “afgewerkt”? | **€2.500 – €4.000 eenmalig** + optioneel onderhoud |
| Met betalingen + mail + SLA? | **€5.000 – €8.000** |

Start met **één pilootklant** tegen een scherpere prijs in ruil voor testimonial en foto’s op je site.
