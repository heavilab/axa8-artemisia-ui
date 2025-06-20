"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    target?: string;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
      isPendingFeature?: boolean;
      target?: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a
                            href={subItem.isPendingFeature ? "#" : subItem.url}
                            target={subItem.target}
                            rel={
                              subItem.target === "_blank"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                              subItem.isActive && "bg-muted font-medium",
                              subItem.isPendingFeature
                                ? "text-muted-foreground cursor-default hover:bg-transparent"
                                : "hover:bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                subItem.isPendingFeature &&
                                  "text-muted-foreground"
                              )}
                            >
                              {subItem.title}
                            </span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a
                  href={item.url}
                  target={item.target}
                  rel={
                    item.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className="flex items-center gap-2"
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
