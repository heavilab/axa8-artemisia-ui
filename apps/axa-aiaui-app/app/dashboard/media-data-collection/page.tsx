import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Media Data Collection</h1>
        <p className="max-w-3xl text-muted-foreground">
          Configure how incoming media data is processed, whether through
          API-based pipelines or manual uploads. Monitor data quality across
          versions and campaigns.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        <MediaCard title="Business Rules" href="/dashboard/business-rules" />
        <MediaCard title="Node Mappings" disabled />
      </div>
    </div>
  );
}

function MediaCard({
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
