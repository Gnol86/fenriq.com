import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";
import OrgButton from "./org-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { defaultLocale } from "@/i18n/config";

export async function AppSidebar({ children }) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });

    const user = session?.user;

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });
    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );
    return (
        <Sidebar>
            <SidebarHeader>
                <OrgButton
                    userOrganizations={userOrganizations}
                    activeUserOrganization={activeUserOrganization}
                />
            </SidebarHeader>
            <SidebarContent>{children}</SidebarContent>
            <SidebarFooter>
                <UserButton
                    user={user}
                    isImpersonating={session?.session?.impersonatedBy}
                    currentLocale={locale}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
