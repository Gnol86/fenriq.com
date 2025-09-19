import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { needUser } from "@/lib/auth";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Layout({ children }) {
  const user = await needUser();

  return (
    <SidebarProvider>
      <AppSidebar>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/orgs/new">
                    <Plus className="opacity-60" />
                    Créer un document
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </AppSidebar>
      <main className="relative p-10 w-full h-dvh">
        <SidebarTrigger className="absolute top-2 left-2 block lg:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
}
