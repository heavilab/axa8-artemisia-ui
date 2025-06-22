"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Globe,
  DollarSign,
  FileText,
  Users,
  Database,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CentralizationToolsPage() {
  const tools = [
    {
      title: "Countries",
      description:
        "Country configurations with currency and language settings.",
      icon: Globe,
      href: "/dashboard/countries",
    },
    {
      title: "Currency Exchange Rates",
      description: "Foreign exchange rates and currency conversion data.",
      icon: DollarSign,
      href: "/dashboard/currency-exchange-rates",
    },
    {
      title: "Data Glossary",
      description:
        "Reference guide for data field definitions and specifications.",
      icon: FileText,
      href: "/dashboard/data-glossary",
    },
    {
      title: "Business Classification Levels",
      description:
        "Hierarchical business classification with definitions and examples.",
      icon: Layers,
      href: "/dashboard/business-classification-levels",
    },
    {
      title: "Media Categorizations",
      description: "Hierarchical media categorizations with definitions.",
      icon: Database,
      href: "/dashboard/media-categorizations",
    },
    {
      title: "Contact Directory",
      description: "Team contacts and contact information.",
      icon: Users,
      href: "/dashboard/contacts",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Centralization Tools</h1>
        <p className="text-muted-foreground mt-2">
          Manage and configure centralized data and settings for the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.title} className="transition-shadow">
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
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </CardDescription>
                <Link href={tool.href}>
                  <Button variant="outline" className="w-full cursor-pointer">
                    <span>Open Tool</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          About Centralization Tools
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          These tools help maintain consistent data across the platform. Each
          tool serves a specific purpose in centralizing and standardizing
          information that is used throughout the application. Use these tools
          to manage reference data, configurations, and team information.
        </p>
      </div>
    </div>
  );
}
