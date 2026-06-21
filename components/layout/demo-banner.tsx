import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="border-b border-verdec-yellow/30 bg-verdec-yellow/10 px-4 py-2 text-center text-sm">
      <span className="text-muted-foreground">
        Verdec Afhaalplatform —{" "}
        <strong className="text-foreground">demo & verkoopklare</strong> MVP voor Belgische frituur
      </span>
      <Link
        href="/admin/login"
        className="ml-2 inline-flex items-center gap-1 font-medium text-verdec-yellow hover:underline"
      >
        Eigenaar inloggen
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
