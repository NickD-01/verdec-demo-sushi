export const dynamic = 'force-dynamic'

import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/customer-footer";
import { DemoBanner } from "@/components/layout/demo-banner";
import { getSettings } from "@/lib/settings";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <CustomerHeader restaurantName={settings.restaurantName} />
      <main className="flex-1">{children}</main>
      <CustomerFooter
        restaurantName={settings.restaurantName}
        address={settings.address}
        phone={settings.phone}
      />
    </div>
  );
}
