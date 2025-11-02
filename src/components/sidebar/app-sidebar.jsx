import { defaultLocale } from "@lib/i18n/config";
import { AppWindow } from "lucide-react";
import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { FeedbackButton } from "@/components/feedback-button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { ActiveSidebarLink } from "./active-sidebar-link";
import OrgButton from "./org-button";
import UserButton from "./user-button";

export async function AppSidebar({ children }) {
    const t = await getTranslations("sidebar.user_button");
    const h = await headers();
    const pathname = h.get("x-pathname");
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale;
    const session = await auth.api.getSession({
        headers: h, // you need to pass the headers object.
    });

    const user = session?.user;

    // Only fetch organizations if we have a valid session
    const userOrganizations = session
        ? await auth.api.listOrganizations({
              headers: h,
          })
        : [];

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session?.session?.activeOrganizationId
    );

    const isOnApp = pathname?.startsWith("/app");

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <OrgButton
                    userOrganizations={userOrganizations}
                    activeUserOrganization={activeUserOrganization}
                />
            </SidebarHeader>

            <SidebarContent>{children}</SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <FeedbackButton />
                    </SidebarMenuItem>
                    {!isOnApp && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink
                                href="/app"
                                className="text-primary"
                            >
                                <AppWindow />
                                <span>{t("return_to_app")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                    <UserButton
                        user={user}
                        isImpersonating={session?.session?.impersonatedBy}
                        currentLocale={locale}
                    />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
