import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // helper to join classnames

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">ArtemisIA</h1>
        <p className="max-w-3xl text-muted-foreground">
          ArtemisIA is a comprehensive solution designed to mitigate media price
          inflation by leveraging Cloud, AI, and automation to enhance
          operational efficiency and drive higher business value. This interface
          in particular aims to simplify the data configuration process for
          entities, agencies and GBS.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <HomeCard
          title="Media Reporting"
          href="https://lookerstudio.google.com/u/0/reporting/70b7b2a7-8f4b-4a79-94e3-03f01f03b927/page/p_hsmk6prold"
        />
        <HomeCard
          title="Centralization Tools"
          href="/dashboard/centralization-tools"
        />
        <HomeCard
          title="Media Data Collection"
          href="/dashboard/media-data-collection"
        />
        <HomeCard title="Services" disabled />
      </div>
    </div>
  );
}

function HomeCard({
  title,
  href,
  disabled = false,
}: {
  title: string;
  href?: string;
  disabled?: boolean;
}) {
  const isExternal = href?.startsWith("http");

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

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardComponent}
      </a>
    );
  }

  return (
    <Link href={href} className="block h-full">
      {cardComponent}
    </Link>
  );
}
