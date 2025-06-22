import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Upload } from "lucide-react";

export default function Page() {
  const apiTools = [
    {
      title: "Business Rules",
      description:
        "Define and manage business rules for data processing and validation.",
      href: "/dashboard/business-rules",
      icon: Database,
    },
    {
      title: "Node Mappings",
      description:
        "Configure data node mappings for API-based data collection.",
      href: "/dashboard/node-mappings",
      icon: Database,
    },
  ];

  const nonApiTools = [
    {
      title: "MDC Templates",
      description:
        "Upload and manage templates for manual data collection processes.",
      href: "/dashboard/mdc-template",
      icon: Upload,
    },
  ];

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

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">API Data Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.title}
                  className="transition-shadow flex flex-col"
                >
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
                      <Link href={tool.href}>
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          <span>Open Tool</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Non-API Data Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonApiTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.title}
                  className="transition-shadow flex flex-col"
                >
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
                      <Link href={tool.href}>
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          <span>Open Tool</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
