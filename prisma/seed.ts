import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FOOD_IMAGES } from "../lib/images";

const prisma = new PrismaClient();

const categories = [
  { name: "Sushi sets",      slug: "sets",    sortOrder: 1 },
  { name: "Maki & Rolls",   slug: "maki",    sortOrder: 2 },
  { name: "Nigiri",          slug: "nigiri",  sortOrder: 3 },
  { name: "Warme gerechten", slug: "warm",    sortOrder: 4 },
  { name: "Dranken",         slug: "drinks",  sortOrder: 5 },
];

const extras = [
  { name: "Extra wasabi",    slug: "extra-wasabi",   kind: "SAUCE", description: "Extra wasabi",        extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceSpicy,  sortOrder: 1 },
  { name: "Extra gember",    slug: "extra-gember",   kind: "SAUCE", description: "Extra ingelegde gember", extraPrice: 0.5, imageUrl: FOOD_IMAGES.saucePickle, sortOrder: 2 },
  { name: "Extra soja saus", slug: "extra-soja",     kind: "SAUCE", description: "Extra soja saus",     extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceTomato, sortOrder: 3 },
  { name: "Sriracha",        slug: "sriracha",       kind: "SAUCE", description: "Pittige sriracha",    extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceCurry,  sortOrder: 4 },
];

const products = [
  { name: "Salmon Set 10st",    description: "10 stuks verse zalm sushi — mix van nigiri en maki.",               price: 14.5, imageUrl: FOOD_IMAGES.salmonSet,      popular: true,  allowsSauceCustomization: true,  categorySlug: "sets" },
  { name: "Rainbow Roll 8st",   description: "8 stuks met zalm, tonijn, avocado en komkommer.",                   price: 16.0, imageUrl: FOOD_IMAGES.rainbowRoll,    popular: true,  allowsSauceCustomization: true,  categorySlug: "sets" },
  { name: "California Roll 8st",description: "Krab, avocado en komkommer — een klassieker.",                      price: 12.5, imageUrl: FOOD_IMAGES.californiaRoll, popular: false, allowsSauceCustomization: true,  categorySlug: "maki" },
  { name: "Tuna Roll 6st",      description: "Verse tonijn met avocado.",                                         price: 11.0, imageUrl: FOOD_IMAGES.tunaRoll,       popular: false, allowsSauceCustomization: true,  categorySlug: "maki" },
  { name: "Veggi Roll 6st",     description: "Komkommer, avocado en geroosterde paprika.",                        price: 9.5,  imageUrl: FOOD_IMAGES.veggiRoll,      popular: false, allowsSauceCustomization: false, categorySlug: "maki" },
  { name: "Salmon Nigiri 2st",  description: "2 stuks verse zalm op sushirijst.",                                 price: 6.5,  imageUrl: FOOD_IMAGES.salmonNigiri,   popular: true,  allowsSauceCustomization: true,  categorySlug: "nigiri" },
  { name: "Tuna Nigiri 2st",    description: "2 stuks verse tonijn op sushirijst.",                               price: 6.5,  imageUrl: FOOD_IMAGES.tunaNigiri,     popular: false, allowsSauceCustomization: true,  categorySlug: "nigiri" },
  { name: "Gyoza 6st",          description: "Gestoomde dumplings gevuld met varkensvlees en kool.",              price: 8.0,  imageUrl: FOOD_IMAGES.gyoza,          popular: true,  allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Edamame",            description: "Gezouten edamame boontjes, warm geserveerd.",                       price: 4.5,  imageUrl: FOOD_IMAGES.edamame,        popular: false, allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Miso soep",          description: "Traditionele miso soep met tofu en zeewier.",                      price: 3.5,  imageUrl: FOOD_IMAGES.misoSoep,       popular: false, allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Japanse groene thee",description: "Authentieke sencha thee.",                                          price: 2.5,  imageUrl: FOOD_IMAGES.thee,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
  { name: "Japans bier",        description: "Asahi 33cl.",                                                       price: 3.5,  imageUrl: FOOD_IMAGES.bier,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
  { name: "Frisdrank",          description: "Coca-Cola, Fanta of water — 33cl.",                                 price: 2.5,  imageUrl: FOOD_IMAGES.cola,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
];

async function seedDemoOrders(productMap: Record<string, { id: string; price: number; name: string }>) {
  const p1 = productMap["Salmon Set 10st"];
  const p2 = productMap["Gyoza 6st"];
  const p3 = productMap["Japanse groene thee"];
  if (!p1 || !p2 || !p3) return;
  const demoOrders = [
    { daysAgo: 0, status: "PENDING",   name: "Jan Peeters",    phone: "+32 470 11 22 33", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 0, status: "PREPARING", name: "Marie Dubois",   phone: "+32 471 44 55 66", paymentMethod: "CASH",   paymentStatus: "UNPAID" },
    { daysAgo: 1, status: "COMPLETED", name: "Tom Janssens",   phone: "+32 472 77 88 99", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 2, status: "COMPLETED", name: "Lisa Vermeulen", phone: "+32 473 00 11 22", paymentMethod: "CASH",   paymentStatus: "PAID" },
    { daysAgo: 3, status: "COMPLETED", name: "Pieter De Smet", phone: "+32 474 33 44 55", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 4, status: "COMPLETED", name: "Emma Claes",     phone: "+32 475 66 77 88", paymentMethod: "CASH",   paymentStatus: "PAID" },
  ];
  for (let i = 0; i < demoOrders.length; i++) {
    const demo = demoOrders[i];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - demo.daysAgo);
    createdAt.setHours(12 + (i % 6), 30, 0, 0);
    const total = p1.price + p2.price + p3.price;
    const orderNumber = `SH-DEMO-${String(1000 + i)}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (existing) continue;
    const slotDate = new Date(createdAt);
    slotDate.setMinutes(Math.ceil(slotDate.getMinutes() / 15) * 15, 0, 0);
    await prisma.order.create({
      data: {
        orderNumber, customerName: demo.name, customerPhone: demo.phone,
        pickupTime: slotDate.toLocaleString("nl-BE", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
        pickupSlot: slotDate.toISOString(), status: demo.status, total,
        paymentMethod: demo.paymentMethod, paymentStatus: demo.paymentStatus, createdAt,
        items: { create: [
          { productId: p1.id, quantity: 1, price: p1.price, name: p1.name },
          { productId: p2.id, quantity: 1, price: p2.price, name: p2.name },
          { productId: p3.id, quantity: 1, price: p3.price, name: p3.name },
        ]},
      },
    });
  }
}

async function main() {
  console.log("Seeding Sushi Demo database...");
  const adminEmail = process.env.ADMIN_EMAIL || "owner@verdec.be";
  const adminPassword = process.env.ADMIN_PASSWORD || "VerdecDemo2026!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword, name: "Zaakvoerder", role: "OWNER" },
  });
  await prisma.settings.upsert({
    where: { id: "default" },
    update:  { restaurantName: "Sushi Demo", phone: "0499 00 00 00", address: "Voorbeeldstraat 1, 1000 Brussel", openingHours: "Di-zo: 12:00 - 21:00", tagline: "Authentieke Japanse sushi, vers bereid", minLeadTimeMinutes: 20, slotIntervalMinutes: 15, maxOrdersPerSlot: 8, openTime: "12:00", closeTime: "21:00" },
    create: { id: "default", restaurantName: "Sushi Demo", phone: "0499 00 00 00", address: "Voorbeeldstraat 1, 1000 Brussel", openingHours: "Di-zo: 12:00 - 21:00", tagline: "Authentieke Japanse sushi, vers bereid", minLeadTimeMinutes: 20, slotIntervalMinutes: 15, maxOrdersPerSlot: 8, openTime: "12:00", closeTime: "21:00" },
  });
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: { name: cat.name, sortOrder: cat.sortOrder }, create: cat });
  }
  for (const item of extras) {
    await prisma.sauce.upsert({ where: { slug: item.slug }, update: item, create: item });
  }
  const categoryMap = await prisma.category.findMany();
  const slugToId = Object.fromEntries(categoryMap.map((c) => [c.slug, c.id]));
  const productMap: Record<string, { id: string; price: number; name: string }> = {};
  for (const product of products) {
    const categoryId = slugToId[product.categorySlug];
    if (!categoryId) continue;
    const data = { name: product.name, description: product.description, price: product.price, imageUrl: product.imageUrl, popular: product.popular, available: true, allowsSauceCustomization: product.allowsSauceCustomization, categoryId };
    const existing = await prisma.product.findFirst({ where: { name: product.name, categoryId } });
    const record = existing ? await prisma.product.update({ where: { id: existing.id }, data }) : await prisma.product.create({ data });
    productMap[product.name] = { id: record.id, price: record.price, name: record.name };
  }
  const allExtras = await prisma.sauce.findMany();
  const allExtraIds = allExtras.map((s) => s.id);
  for (const product of products.filter((p) => p.allowsSauceCustomization)) {
    const p = productMap[product.name];
    if (!p) continue;
    await prisma.productSauce.deleteMany({ where: { productId: p.id } });
    if (allExtraIds.length > 0) {
      await prisma.productSauce.createMany({ data: allExtraIds.map((sauceId) => ({ productId: p.id, sauceId })) });
    }
  }
  await seedDemoOrders(productMap);
  console.log("Seed completed!");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

const prisma = new PrismaClient();

const categories = [
  { name: "Friet",    slug: "friet",   sortOrder: 1 },
  { name: "Snacks",   slug: "snacks",  sortOrder: 2 },
  { name: "Burgers",  slug: "burgers", sortOrder: 3 },
  { name: "Dranken",  slug: "drinks",  sortOrder: 4 },
];

const seasonings: {
  name: string; slug: string; kind: string; icon: string;
  description: string; extraPrice: number; imageUrl: string; sortOrder: number;
}[] = [
  {
    name: "Met zout", slug: "met-zout", kind: "SEASONING", icon: "🧂",
    description: "Met zout", extraPrice: 0, imageUrl: FOOD_IMAGES.sauceMustard, sortOrder: 1,
  },
  {
    name: "Zonder zout", slug: "zonder-zout", kind: "SEASONING", icon: "🚫",
    description: "Zonder zout", extraPrice: 0, imageUrl: FOOD_IMAGES.sauceMustard, sortOrder: 2,
  },
];

const sauces = [
  { name: "Mayonaise",   slug: "mayonaise",   kind: "SAUCE", description: "Klassieke Belgische mayo",       extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceMayo,     sortOrder: 1 },
  { name: "Ketchup",     slug: "ketchup",     kind: "SAUCE", description: "Tomatenketchup",                 extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceTomato,   sortOrder: 2 },
  { name: "Currysaus",   slug: "currysaus",   kind: "SAUCE", description: "Milde currysaus",                extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceCurry,    sortOrder: 3 },
  { name: "Cocktailsaus",slug: "cocktailsaus",kind: "SAUCE", description: "Romige cocktailsaus",            extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceCocktail, sortOrder: 4 },
  { name: "Andalouse",   slug: "andalouse",   kind: "SAUCE", description: "Pikante andalousesaus met paprika", extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceSpicy, sortOrder: 5 },
  { name: "Samurai",     slug: "samurai",     kind: "SAUCE", description: "Pittige samuraisaus",            extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceGarlic,   sortOrder: 6 },
  { name: "Pickles",     slug: "pickles",     kind: "SAUCE", description: "Zoetzure picklessaus",           extraPrice: 0.5, imageUrl: FOOD_IMAGES.saucePickle,   sortOrder: 7 },
  { name: "Musterd",     slug: "musterd",     kind: "SAUCE", description: "Scherpe mosterd",               extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceMustard,  sortOrder: 8 },
];

const products = [
  // Friet
  {
    name: "Megafriet",
    description: "Onze signature portie — goudbruin gebakken friet in extra groot formaat.",
    price: 5.5,
    imageUrl: FOOD_IMAGES.megafriet,
    popular: true,
    allowsSauceCustomization: true,
    categorySlug: "friet",
  },
  {
    name: "Middel friet",
    description: "Klassieke portie verse Belgische friet, krokant en warm.",
    price: 4.0,
    imageUrl: FOOD_IMAGES.frietMiddel,
    popular: true,
    allowsSauceCustomization: true,
    categorySlug: "friet",
  },
  {
    name: "Klein friet",
    description: "Kleine portie verse Belgische friet — ideaal als kinderportion of bijgerecht.",
    price: 3.0,
    imageUrl: FOOD_IMAGES.frietKlein,
    popular: false,
    allowsSauceCustomization: true,
    categorySlug: "friet",
  },
  // Snacks
  {
    name: "Curryworst Speciale",
    description: "Onze huisspecialiteit — worst met warme currysaus en een geheim kruidenmengsel. Een must-try.",
    price: 4.5,
    imageUrl: FOOD_IMAGES.curryworst,
    popular: true,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  {
    name: "Frikandel",
    description: "Klassieke Belgische frikandel, knapperig gebakken.",
    price: 2.5,
    imageUrl: FOOD_IMAGES.frikandel,
    popular: true,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  {
    name: "Loempia",
    description: "Knapperige loempia gevuld met groenten en varkensvlees.",
    price: 3.0,
    imageUrl: FOOD_IMAGES.loempia,
    popular: true,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  {
    name: "Goulashkroket",
    description: "Romige kroket gevuld met goulashstoofvlees — een echte klassieker.",
    price: 3.0,
    imageUrl: FOOD_IMAGES.kroket,
    popular: true,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  {
    name: "Boulette",
    description: "Sappige gehaktbal in tomatensaus.",
    price: 3.5,
    imageUrl: FOOD_IMAGES.boulette,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  {
    name: "Pitta",
    description: "Warm pitabrood met sla, tomaat, ajuin en saus naar keuze.",
    price: 5.0,
    imageUrl: FOOD_IMAGES.pitta,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "snacks",
  },
  // Burgers
  {
    name: "Hamburger",
    description: "Sappige hamburger met sla, tomaat, ajuin en onze huismayonaise.",
    price: 7.0,
    imageUrl: FOOD_IMAGES.hamburger,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "burgers",
  },
  {
    name: "Chickenburger",
    description: "Krokante kipburger met sla, tomaat en currysaus.",
    price: 7.5,
    imageUrl: FOOD_IMAGES.chickenburger,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "burgers",
  },
  // Dranken
  {
    name: "Coca-Cola",
    description: "Blik 33cl.",
    price: 2.5,
    imageUrl: FOOD_IMAGES.cola,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "drinks",
  },
  {
    name: "Fanta",
    description: "Blik 33cl — sinaasappel of citroen.",
    price: 2.5,
    imageUrl: FOOD_IMAGES.fanta,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "drinks",
  },
  {
    name: "Plat water",
    description: "Flesje 50cl bronwater.",
    price: 2.0,
    imageUrl: FOOD_IMAGES.water,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "drinks",
  },
  {
    name: "Jupiler",
    description: "Blikje 33cl Belgisch pilsner.",
    price: 3.0,
    imageUrl: FOOD_IMAGES.beer,
    popular: false,
    allowsSauceCustomization: false,
    categorySlug: "drinks",
  },
];

async function seedDemoOrders(
  productMap: Record<string, { id: string; price: number; name: string }>
) {
  const megafriet = productMap["Megafriet"];
  const curryworst = productMap["Curryworst Speciale"];
  const cola = productMap["Coca-Cola"];
  if (!megafriet || !curryworst || !cola) return;

  const demoOrders = [
    { daysAgo: 0, status: "PENDING",   name: "Jan Peeters",    phone: "+32 470 11 22 33", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 0, status: "PREPARING", name: "Marie Dubois",   phone: "+32 471 44 55 66", paymentMethod: "CASH",   paymentStatus: "UNPAID" },
    { daysAgo: 1, status: "COMPLETED", name: "Tom Janssens",   phone: "+32 472 77 88 99", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 2, status: "COMPLETED", name: "Lisa Vermeulen", phone: "+32 473 00 11 22", paymentMethod: "CASH",   paymentStatus: "PAID" },
    { daysAgo: 3, status: "COMPLETED", name: "Pieter De Smet", phone: "+32 474 33 44 55", paymentMethod: "ONLINE", paymentStatus: "PAID" },
    { daysAgo: 4, status: "COMPLETED", name: "Emma Claes",     phone: "+32 475 66 77 88", paymentMethod: "CASH",   paymentStatus: "PAID" },
  ];

  for (let i = 0; i < demoOrders.length; i++) {
    const demo = demoOrders[i];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - demo.daysAgo);
    createdAt.setHours(12 + (i % 6), 30, 0, 0);

    const total = megafriet.price + curryworst.price + cola.price;
    const orderNumber = `DF-DEMO-${String(1000 + i)}`;

    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (existing) continue;

    const slotDate = new Date(createdAt);
    slotDate.setMinutes(Math.ceil(slotDate.getMinutes() / 15) * 15, 0, 0);

    await prisma.order.create({
      data: {
        orderNumber,
        customerName: demo.name,
        customerPhone: demo.phone,
        pickupTime: slotDate.toLocaleString("nl-BE", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
        pickupSlot: slotDate.toISOString(),
        status: demo.status,
        total,
        paymentMethod: demo.paymentMethod,
        paymentStatus: demo.paymentStatus,
        createdAt,
        items: {
          create: [
            { productId: megafriet.id,  quantity: 1, price: megafriet.price,  name: megafriet.name },
            { productId: curryworst.id, quantity: 1, price: curryworst.price, name: curryworst.name },
            { productId: cola.id,       quantity: 1, price: cola.price,       name: cola.name },
          ],
        },
      },
    });
  }
}

async function main() {
  console.log("Seeding Frituur Demo database...");

  // Admin-account — stel in via .env (ADMIN_EMAIL / ADMIN_PASSWORD)
  const adminEmail = process.env.ADMIN_EMAIL || "owner@verdec.be";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword, name: "Zaakvoerder", role: "OWNER" },
  });

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      restaurantName: "Frituur Demo",
      phone: "0499 00 00 00",
      address: "Voorbeeldstraat 1, 1000 Brussel",
      openingHours: "Wo-zo: 11:30 - 21:00",
      tagline: "Verse friet & snacks, snel afhalen",
      minLeadTimeMinutes: 20,
      slotIntervalMinutes: 15,
      maxOrdersPerSlot: 8,
      openTime: "11:30",
      closeTime: "21:00",
    },
    create: {
      id: "default",
      restaurantName: "Frituur Demo",
      phone: "0499 00 00 00",
      address: "Voorbeeldstraat 1, 1000 Brussel",
      openingHours: "Wo-zo: 11:30 - 21:00",
      tagline: "Verse friet & snacks, snel afhalen",
      minLeadTimeMinutes: 20,
      slotIntervalMinutes: 15,
      maxOrdersPerSlot: 8,
      openTime: "11:30",
      closeTime: "21:00",
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: cat,
    });
  }

  for (const item of [...seasonings, ...sauces]) {
    const row = { ...item, kind: item.kind ?? "SAUCE" };
    await prisma.sauce.upsert({
      where: { slug: item.slug },
      update: row,
      create: row,
    });
  }

  const categoryMap = await prisma.category.findMany();
  const slugToId = Object.fromEntries(categoryMap.map((c) => [c.slug, c.id]));
  const productMap: Record<string, { id: string; price: number; name: string }> = {};

  for (const product of products) {
    const categoryId = slugToId[product.categorySlug];
    if (!categoryId) continue;
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      popular: product.popular,
      available: true,
      allowsSauceCustomization: product.allowsSauceCustomization,
      categoryId,
    };
    const existing = await prisma.product.findFirst({ where: { name: product.name, categoryId } });
    let record;
    if (existing) {
      record = await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      record = await prisma.product.create({ data });
    }
    productMap[product.name] = { id: record.id, price: record.price, name: record.name };
  }

  // Koppel sauzen én seasonings aan producten met allowsSauceCustomization
  const allExtras = await prisma.sauce.findMany();
  const allExtraIds = allExtras.map((s) => s.id);
  for (const product of products.filter((p) => p.allowsSauceCustomization)) {
    const p = productMap[product.name];
    if (!p) continue;
    await prisma.productSauce.deleteMany({ where: { productId: p.id } });
    if (allExtraIds.length > 0) {
      await prisma.productSauce.createMany({
        data: allExtraIds.map((sauceId) => ({ productId: p.id, sauceId })),
      });
    }
  }

  await seedDemoOrders(productMap);

  console.log("Seed completed!");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
