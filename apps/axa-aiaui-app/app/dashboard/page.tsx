import Link from "next/link";

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
        <Card title="Media reporting" href="/dashboard" />
        <Card
          title="Centralization tools"
          href="/dashboard/centralization-tools"
        />
        <Card
          title="Media Data collection"
          href="/dashboard/media-data-collection"
        />
        <Card title="Services" disabled />
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data Quality status</h2>
        <p className="text-muted-foreground">
          [The Looker Data Quality dashboard - Campaign Overview comparison tab]
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 max-w-6xl">
        <div className="rounded-xl border p-6 space-y-4 hover:shadow-md transition-shadow duration-200">
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
        </div>

        <div className="rounded-xl border p-6 space-y-4 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold">Non-API Data Collection</h3>
          <ActionLink href="/mdct">Upload filled template →</ActionLink>
        </div>
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
    <div className={`${baseStyle} ${disabledStyle}`}>{title}</div>
  ) : (
    <Link href={href!} className={`${baseStyle} ${interactive}`}>
      {title}
    </Link>
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
      className="block text-black decoration-transparent hover:decoration-inherit hover:text-[#00008F] hover:underline transition-colors"
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
      className="block text-xs text-muted-foreground decoration-transparent hover:decoration-inherit hover:text-[#00008F] hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}
