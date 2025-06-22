"use client";

import * as React from "react";
import Image from "next/image";
import { FileBarChart, FolderGit2, DatabaseZap } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@/lib/hooks/use-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchProfile() {
      if (user?.email) {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setProfile(snapshot.docs[0].data() as Profile);
        }
      }
    }
    fetchProfile();
  }, [user]);

  const navUser = user
    ? profile
      ? {
          name:
            `${profile.firstName} ${profile.lastName}`.trim() ||
            user.displayName ||
            user.email ||
            "User",
          email: profile.email || user.email || "",
          avatar: user.photoURL || "/avatars/axa.jpg",
          role: profile.role,
        }
      : {
          name: user.displayName || user.email || "User",
          email: user.email || "",
          avatar: user.photoURL || "/avatars/axa.jpg",
        }
    : {
        name: "Not logged in",
        email: "",
        avatar: "/avatars/axa.jpg",
      };

  // Determine active navigation items based on current pathname
  const navMain = [
    {
      title: "Media Reporting",
      url: "https://lookerstudio.google.com/u/0/reporting/70b7b2a7-8f4b-4a79-94e3-03f01f03b927/page/p_hsmk6prold",
      icon: FileBarChart,
      target: "_blank",
    },
    {
      title: "Centralization Tools",
      url: "#",
      icon: FolderGit2,
      items: [
        {
          title: "Countries",
          url: "/dashboard/countries",
          isActive: pathname === "/dashboard/countries",
        },
        {
          title: "Currency Exchange Rates",
          url: "/dashboard/currency-exchange-rates",
          isActive: pathname === "/dashboard/currency-exchange-rates",
        },
        {
          title: "Data Glossary",
          url: "/dashboard/data-glossary",
          isActive: pathname === "/dashboard/data-glossary",
        },
        {
          title: "Business Classification Levels",
          url: "/dashboard/business-classification-levels",
          isActive: pathname === "/dashboard/business-classification-levels",
        },
        {
          title: "Media Categorizations",
          url: "/dashboard/media-categorizations",
          isActive: pathname === "/dashboard/media-categorizations",
        },
      ],
    },
    {
      title: "Media Data Collection",
      url: "#",
      icon: DatabaseZap,
      items: [
        {
          title: "Business Rules",
          url: "/dashboard/business-rules",
          isActive: pathname === "/dashboard/business-rules",
          badge: "API",
        },
        {
          title: "Node Mappings",
          url: "/dashboard/node-mappings",
          isActive: pathname === "/dashboard/node-mappings",
          badge: "API",
        },
        {
          title: "MDC Template",
          url: "/dashboard/mdc-template",
          isActive: pathname === "/dashboard/mdc-template",
        },
      ],
    },
  ];

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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
