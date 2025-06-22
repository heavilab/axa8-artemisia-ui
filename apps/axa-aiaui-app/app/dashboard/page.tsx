import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Settings,
  Database,
  Wrench,
} from "lucide-react";

export default function Page() {
  const tools = [
    {
      title: "Media Reporting",
      description:
        "Access comprehensive media reporting and analytics dashboards for performance insights.",
      href: "https://lookerstudio.google.com/u/0/reporting/70b7b2a7-8f4b-4a79-94e3-03f01f03b927/page/p_hsmk6prold",
      icon: BarChart3,
      external: true,
    },
    {
      title: "Centralization Tools",
      description:
        "Manage reference data, business classifications, and organizational information.",
      href: "/dashboard/centralization-tools",
      icon: Settings,
      external: false,
    },
    {
      title: "Media Data Collection",
      description:
        "Configure data processing rules and manage templates for media data collection.",
      href: "/dashboard/media-data-collection",
      icon: Database,
      external: false,
    },
    {
      title: "Services",
      description: "Access additional services and integrations (coming soon).",
      href: undefined,
      icon: Wrench,
      external: false,
      disabled: true,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const cardContent = (
            <Card key={tool.title} className="transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <CardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </CardDescription>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={tool.disabled}
                  >
                    <span>{tool.disabled ? "Coming Soon" : "Open"}</span>
                    {!tool.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );

          if (tool.disabled) {
            return cardContent;
          }

          if (tool.external) {
            return (
              <a
                key={tool.title}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link key={tool.title} href={tool.href!} className="block">
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
