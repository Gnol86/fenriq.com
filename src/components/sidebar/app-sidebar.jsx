import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";
import {
    getCurrentOrganization,
    getListOrganizations,
    requireUser,
} from "@/lib/auth-access";
import OrgButton from "./org-button";

export async function AppSidebar({ children }) {
    const [user, organizations = [], activeOrganization] = await Promise.all([
        requireUser(),
        getListOrganizations(),
        getCurrentOrganization(),
    ]);

    return (
        <Sidebar>
            <SidebarHeader>
                <OrgButton
                    organizations={organizations ?? []}
                    activeOrganization={activeOrganization}
                />
            </SidebarHeader>
            <SidebarContent>{children}</SidebarContent>
            <SidebarFooter>
                <UserButton user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
