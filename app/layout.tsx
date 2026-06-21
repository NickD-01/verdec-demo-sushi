import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

// TODO: pas title/description/keywords aan voor de klant
export const metadata: Metadata = {
  title: {
    default: "Sushi Demo | Online bestellen",
    template: "%s | Demo",
  },
  description: "Bestel online en haal af bij Restaurant Naam.",
  keywords: ["afhaal", "restaurant", "bestellen"],
  openGraph: {
    title: "Restaurant Naam â€” Afhalen",
    description: "Bestel online en haal af bij Restaurant Naam.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
