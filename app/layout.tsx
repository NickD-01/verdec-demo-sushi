import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Sushi Demo | Online bestellen",
    template: "%s | Sushi Demo",
  },
  description: "Bestel online verse sushi, maki en Japanse specialiteiten — snel afhalen.",
  keywords: ["sushi", "japans", "afhaal", "bestellen", "maki", "nigiri"],
  openGraph: {
    title: "Sushi Demo — Afhalen",
    description: "Bestel online verse sushi en haal af.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Shippori+Mincho:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
