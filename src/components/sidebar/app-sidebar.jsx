import { FeedbackButton } from "@/components/feedback-button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { defaultLocale } from "@lib/i18n/config";
import { cookies, headers } from "next/headers";
import OrgButton from "./org-button";
import UserButton from "./user-button";

export async function AppSidebar({ children }) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });

    const user = session?.user;

    // Only fetch organizations if we have a valid session
    const userOrganizations = session
        ? await auth.api.listOrganizations({
              headers: await headers(),
          })
        : [];

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session?.session?.activeOrganizationId
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
                <FeedbackButton />
                <UserButton
                    user={user}
                    isImpersonating={session?.session?.impersonatedBy}
                    currentLocale={locale}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
