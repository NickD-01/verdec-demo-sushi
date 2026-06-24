export const dynamic = 'force-dynamic'

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { FOOD_IMAGES } from "@/lib/images";

export default async function HomePage() {
  const [settings, popularProducts] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { popular: true, available: true },
      include: { category: true },
      take: 4,
    }),
  ]);

  return (
    <>
      {/* Hero — donker, minimalistisch, verticale vermiljoen accentlijn */}
      <section className="relative overflow-hidden bg-verdec-black text-white">
        <Image
          src={FOOD_IMAGES.hero}
          alt="Verse sushi"
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="container relative z-10 mx-auto px-6 py-28 md:py-36">
          <div className="border-l-2 border-verdec-yellow pl-6 md:pl-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-verdec-yellow">
              {settings.restaurantName}
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">
              {settings.tagline}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
              Verse sushi, maki en Japanse specialiteiten — met zorg bereid en
              klaar voor afhaling.
            </p>
            <Link href="/menu" className="mt-10 inline-block">
              <Button size="lg" className="rounded-none px-8 text-sm uppercase tracking-widest">
                Bekijk het menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {popularProducts.length > 0 && (
        <section className="container mx-auto px-6 py-20 md:py-24">
          <div className="mb-12 flex items-end justify-between border-b border-border pb-5">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.3em] text-verdec-yellow">
                おすすめ
              </p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Specialiteiten</h2>
            </div>
            <Link
              href="/menu"
              className="hidden text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Alles bekijken →
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Info — kalme rij met dunne scheidingslijnen, geen schaduwen */}
      <section className="border-t border-border">
        <div className="container mx-auto grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <MapPin className="h-6 w-6 text-verdec-yellow" />
            <h3 className="font-display text-lg font-semibold">Adres</h3>
            <p className="text-sm text-muted-foreground">{settings.address}</p>
          </div>
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Phone className="h-6 w-6 text-verdec-yellow" />
            <h3 className="font-display text-lg font-semibold">Telefoon</h3>
            <p className="text-sm text-muted-foreground">{settings.phone}</p>
          </div>
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Clock className="h-6 w-6 text-verdec-yellow" />
            <h3 className="font-display text-lg font-semibold">Openingsuren</h3>
            <p className="text-sm text-muted-foreground">{settings.openingHours}</p>
          </div>
        </div>
      </section>
    </>
  );
}
