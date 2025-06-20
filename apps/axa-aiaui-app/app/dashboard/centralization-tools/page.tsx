import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Centralization Tools</h1>
        <p className="max-w-3xl text-muted-foreground">
          Standardize and align your marketing data across entities using naming
          conventions, glossaries, and mappings.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        <CentralizationCard title="Countries" href="/dashboard/countries" />
      </div>
    </div>
  );
}

function CentralizationCard({
  title,
  href,
  disabled = false,
}: {
  title: string;
  href?: string;
  disabled?: boolean;
}) {
  const cardComponent = (
    <Card
      className={cn(
        "min-h-[120px] h-full transition-all group",
        !disabled && "cursor-pointer hover:shadow-lg hover:border-primary/40",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="text-lg font-semibold group-hover:text-primary">
          {title}
        </span>
      </CardContent>
    </Card>
  );
  if (!href || disabled) {
    return cardComponent;
  }
  return (
    <Link href={href} className="block h-full">
      {cardComponent}
    </Link>
  );
}
