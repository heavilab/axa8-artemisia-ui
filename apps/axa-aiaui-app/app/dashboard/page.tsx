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

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data Quality status</h2>
        <p className="text-muted-foreground">
          [The Looker Data Quality dashboard - Campaign Overview comparison tab]
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 max-w-6xl">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="px-6 space-y-4">
            <h3 className="text-lg font-semibold">
              API Data Collection and Completion
            </h3>
            <div className="space-y-2">
              <ActionLink href="/dashboard">
                Configure dynamic completion →
              </ActionLink>
              <SmallLink href="/dashboard">
                Go to last draft completion →
              </SmallLink>
              <ActionLink href="/dashboard">
                Configure static completion →
              </ActionLink>
              <SmallLink href="/dashboard">Go to last draft →</SmallLink>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="px-6 space-y-4">
            <h3 className="text-lg font-semibold">Non-API Data Collection</h3>
            <ActionLink href="/mdct">Upload filled template →</ActionLink>
          </CardContent>
        </Card>
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
  return (
    <Card
      className={cn(
        "min-h-[120px] flex items-center justify-center text-lg font-semibold text-center transition-all duration-200",
        !disabled &&
          "hover:shadow-md hover:bg-muted hover:scale-[1.02] cursor-pointer",
        disabled && "text-muted-foreground bg-muted"
      )}
    >
      {disabled ? (
        <span>{title}</span>
      ) : (
        <Link
          href={href!}
          className="w-full h-full flex items-center justify-center"
        >
          {title}
        </Link>
      )}
    </Card>
  );
}

function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block text-sm font-medium text-foreground hover:text-[#00008F] hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}

function SmallLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block text-xs text-muted-foreground hover:text-[#00008F] hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}
