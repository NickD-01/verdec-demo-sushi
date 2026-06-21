export const dynamic = 'force-dynamic'

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone, Sparkles, Truck } from "lucide-react";
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

  const features = [
    {
      icon: Truck,
      title: "Snelle afhaling",
      description: "Bestel vooraf en haal je friet binnen enkele minuten warm en vers op.",
    },
    {
      icon: Sparkles,
      title: "Verse ingrediënten",
      description: "Lokaal geteelde aardappelen, de hele dag vers gebakken.",
    },
    {
      icon: MapPin,
      title: "Lokale Belgische frituur",
      description: "Authentieke frituurervaring in je buurt.",
    },
  ];

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <Image
          src={FOOD_IMAGES.hero}
          alt="Belgische friet"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-verdec-black/90 via-verdec-black/70 to-verdec-black/50" />
        <div className="container relative z-10 mx-auto px-4 py-20 text-center text-white md:text-left">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-verdec-yellow">
            {settings.restaurantName}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            {settings.tagline}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-gray-300">
            Verse sushi en Japanse gerechten, snel afhalen.
          </p>
          <Link href="/menu" className="mt-8 inline-block">
            <Button size="lg" className="text-base">
              Nu bestellen
            </Button>
          </Link>
        </div>
      </section>

      {popularProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Populaire items</h2>
            <p className="mt-2 text-muted-foreground">Klantfavorieten</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg">
                Volledig menu bekijken
              </Button>
            </Link>
          </div>
        </section>
      )}

      <section className="hidden bg-muted/50 py-16 md:block">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">Waarom bij ons</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verdec-yellow/20">
                  <feature.icon className="h-7 w-7 text-verdec-yellow" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto hidden px-4 py-16 md:block">
        <h2 className="mb-8 text-center text-3xl font-bold">Contact</h2>
        <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl border p-6 text-center">
            <MapPin className="mb-3 h-8 w-8 text-verdec-yellow" />
            <h3 className="font-semibold">Adres</h3>
            <p className="mt-1 text-sm text-muted-foreground">{settings.address}</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border p-6 text-center">
            <Phone className="mb-3 h-8 w-8 text-verdec-yellow" />
            <h3 className="font-semibold">Telefoon</h3>
            <p className="mt-1 text-sm text-muted-foreground">{settings.phone}</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border p-6 text-center">
            <Clock className="mb-3 h-8 w-8 text-verdec-yellow" />
            <h3 className="font-semibold">Openingsuren</h3>
            <p className="mt-1 text-sm text-muted-foreground">{settings.openingHours}</p>
          </div>
        </div>
      </section>
    </>
  );
}
