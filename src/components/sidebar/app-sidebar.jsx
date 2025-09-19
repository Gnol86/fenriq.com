import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";
import { needUser } from "@/lib/auth";
import OrgButton from "./org-button";

export async function AppSidebar({ children }) {
  const user = await needUser();
  return (
    <Sidebar>
      <SidebarHeader>
        <OrgButton user={user} />
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        <UserButton user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
