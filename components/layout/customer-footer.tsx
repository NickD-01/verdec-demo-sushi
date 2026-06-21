import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

interface CustomerFooterProps {
  restaurantName: string;
  address: string;
  phone: string;
}

export function CustomerFooter({ restaurantName, address, phone }: CustomerFooterProps) {
  return (
    <footer className="border-t bg-verdec-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2 font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-verdec-yellow text-verdec-black">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              {restaurantName}
            </div>
            <p className="text-sm text-gray-400">
              Bestel je Asian fusion gerechten online bij {restaurantName}.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-verdec-yellow">Snelle links</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/menu" className="hover:text-white">Menu</Link>
              <Link href="/cart" className="hover:text-white">Winkelwagen</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-verdec-yellow">Contact</h4>
            <p className="text-sm text-gray-400">{address}</p>
            <p className="mt-1 text-sm text-gray-400">{phone}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {restaurantName}. Powered by Verdec.
        </div>
      </div>
    </footer>
  );
}
