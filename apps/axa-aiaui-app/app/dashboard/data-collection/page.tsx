import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Data Collection</h1>
        <p className="max-w-3xl text-muted-foreground">
          Configure how incoming media data is processed, whether through
          API-based pipelines or manual uploads. Monitor data quality across
          versions and campaigns.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        <Card title="API Data Collection" disabled />
        <Card title="Non-API Data Collection" disabled />
        <Card title="Data Quality" disabled />
      </div>
    </div>
  );
}

function Card({
  title,
  href,
  disabled = false,
}: {
  title: string;
  href?: string;
  disabled?: boolean;
}) {
  const baseStyle =
    "rounded-xl border p-6 flex items-center justify-center text-lg font-semibold text-center min-h-[120px] transition-all duration-200";
  const interactive =
    "hover:shadow-md hover:bg-[#F9FAFB] hover:scale-[1.02] cursor-pointer";
  const disabledStyle = "text-muted-foreground bg-muted cursor-not-allowed";

  return disabled ? (
    <div className={cn(baseStyle, disabledStyle)}>{title}</div>
  ) : (
    <Link href={href!} className={cn(baseStyle, interactive)}>
      {title}
    </Link>
  );
}
