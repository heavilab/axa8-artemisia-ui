import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="block lg:hidden p-2">
        <SidebarTrigger />
      </div>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
