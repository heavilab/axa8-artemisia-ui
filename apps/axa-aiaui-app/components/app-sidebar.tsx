"use client";

import * as React from "react";
import Image from "next/image";
import { FileBarChart, FolderGit2, DatabaseZap } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Romain Florentz",
    email: "romain@heaviside.fr",
    avatar: "/avatars/axa.jpg",
  },
  navMain: [
    {
      title: "Media Dashboard",
      url: "#",
      icon: FileBarChart,
    },
    {
      title: "Centralization Tools",
      url: "#",
      isActive: true,
      icon: FolderGit2,
      items: [
        { title: "Naming Conventions", url: "#", isPendingFeature: true },
        {
          title: "Data Glossary",
          url: "#",
          isPendingFeature: true,
        },
        { title: "Account Mappings", url: "#", isPendingFeature: true },
        { title: "Country Mappings", url: "/dashboard/country-mappings" },
        { title: "Currency Exchange Rates", url: "#", isPendingFeature: true },
        { title: "Contact Directory", url: "#", isPendingFeature: true },
      ],
    },
    {
      title: "Data Collection",
      url: "#",
      isActive: true,
      icon: DatabaseZap,
      items: [
        { title: "API Collection", url: "#", isPendingFeature: true },
        { title: "Non-API Collection", url: "#", isPendingFeature: true },
        { title: "Data Quality", url: "#", isPendingFeature: true },
      ],
    },
  ],
  navSecondary: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex">
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="AXA Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ArtemisIA</span>
                  <span className="truncate text-xs">v0.1</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
