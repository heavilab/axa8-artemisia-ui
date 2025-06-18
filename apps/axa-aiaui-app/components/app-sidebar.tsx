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
      items: [{ title: "Countries", url: "/dashboard/countries" }],
    },
    {
      title: "Media Data Collection",
      url: "#",
      isActive: true,
      icon: DatabaseZap,
      items: [
        {
          title: "Business Rules",
          url: "/dashboard/business-rules",
        },
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
