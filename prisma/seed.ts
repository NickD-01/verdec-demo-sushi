import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FOOD_IMAGES } from "../lib/images";

const prisma = new PrismaClient();

const categories = [
  { name: "Sushi sets",      slug: "sets",   sortOrder: 1 },
  { name: "Maki & Rolls",   slug: "maki",   sortOrder: 2 },
  { name: "Nigiri",          slug: "nigiri", sortOrder: 3 },
  { name: "Warme gerechten", slug: "warm",   sortOrder: 4 },
  { name: "Dranken",         slug: "drinks", sortOrder: 5 },
];

const extras = [
  { name: "Extra wasabi",    slug: "extra-wasabi", kind: "SAUCE", description: "Extra wasabi",           extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceSpicy,  sortOrder: 1 },
  { name: "Extra gember",    slug: "extra-gember", kind: "SAUCE", description: "Extra ingelegde gember", extraPrice: 0.5, imageUrl: FOOD_IMAGES.saucePickle, sortOrder: 2 },
  { name: "Extra soja saus", slug: "extra-soja",   kind: "SAUCE", description: "Extra soja saus",        extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceTomato, sortOrder: 3 },
  { name: "Sriracha",        slug: "sriracha",     kind: "SAUCE", description: "Pittige sriracha",       extraPrice: 0.5, imageUrl: FOOD_IMAGES.sauceCurry,  sortOrder: 4 },
];

const products = [
  { name: "Salmon Set 10st",     description: "10 stuks verse zalm sushi — mix van nigiri en maki.",              price: 14.5, imageUrl: FOOD_IMAGES.salmonSet,      popular: true,  allowsSauceCustomization: true,  categorySlug: "sets" },
  { name: "Rainbow Roll 8st",    description: "8 stuks met zalm, tonijn, avocado en komkommer.",                  price: 16.0, imageUrl: FOOD_IMAGES.rainbowRoll,    popular: true,  allowsSauceCustomization: true,  categorySlug: "sets" },
  { name: "California Roll 8st", description: "Krab, avocado en komkommer — een klassieker.",                     price: 12.5, imageUrl: FOOD_IMAGES.californiaRoll, popular: false, allowsSauceCustomization: true,  categorySlug: "maki" },
  { name: "Tuna Roll 6st",       description: "Verse tonijn met avocado.",                                        price: 11.0, imageUrl: FOOD_IMAGES.tunaRoll,       popular: false, allowsSauceCustomization: true,  categorySlug: "maki" },
  { name: "Veggi Roll 6st",      description: "Komkommer, avocado en geroosterde paprika.",                       price: 9.5,  imageUrl: FOOD_IMAGES.veggiRoll,      popular: false, allowsSauceCustomization: false, categorySlug: "maki" },
  { name: "Salmon Nigiri 2st",   description: "2 stuks verse zalm op sushirijst.",                                price: 6.5,  imageUrl: FOOD_IMAGES.salmonNigiri,   popular: true,  allowsSauceCustomization: true,  categorySlug: "nigiri" },
  { name: "Tuna Nigiri 2st",     description: "2 stuks verse tonijn op sushirijst.",                              price: 6.5,  imageUrl: FOOD_IMAGES.tunaNigiri,     popular: false, allowsSauceCustomization: true,  categorySlug: "nigiri" },
  { name: "Gyoza 6st",           description: "Gestoomde dumplings gevuld met varkensvlees en kool.",             price: 8.0,  imageUrl: FOOD_IMAGES.gyoza,          popular: true,  allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Edamame",             description: "Gezouten edamame boontjes, warm geserveerd.",                      price: 4.5,  imageUrl: FOOD_IMAGES.edamame,        popular: false, allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Miso soep",           description: "Traditionele miso soep met tofu en zeewier.",                     price: 3.5,  imageUrl: FOOD_IMAGES.misoSoep,       popular: false, allowsSauceCustomization: false, categorySlug: "warm" },
  { name: "Japanse groene thee", description: "Authentieke sencha thee.",                                         price: 2.5,  imageUrl: FOOD_IMAGES.thee,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
  { name: "Japans bier",         description: "Asahi 33cl.",                                                      price: 3.5,  imageUrl: FOOD_IMAGES.bier,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
  { name: "Frisdrank",           description: "Coca-Cola, Fanta of water — 33cl.",                                price: 2.5,  imageUrl: FOOD_IMAGES.cola,           popular: false, allowsSauceCustomization: false, categorySlug: "drinks" },
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
