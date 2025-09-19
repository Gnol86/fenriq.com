import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";
import { requireUser } from "@/lib/data-access";
import OrgButton from "./org-button";

export async function AppSidebar({
    children,
    user: userProp,
    organizations: organizationsProp,
    activeOrganization,
}) {
    const user = userProp ?? (await requireUser());
    const organizations = organizationsProp ?? user?.organizations ?? [];

    return (
        <Sidebar>
            <SidebarHeader>
                <OrgButton
                    organizations={organizations}
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
