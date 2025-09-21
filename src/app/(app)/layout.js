import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentOrganization, requireUser } from "@/lib/auth-access";

export default async function Layout({
    children,
    breadcrumbs,
    sidebarcontent,
}) {
    await requireUser();
    const activeOrganization = await getCurrentOrganization();
    const hasOrganization = Boolean(activeOrganization);
    const organizationLabel = activeOrganization?.name ?? "Organisation";

    return (
        <SidebarProvider>
            <AppSidebar>{sidebarcontent}</AppSidebar>
            <main className="relative p-0 w-full h-dvh">
                <div className="flex items-center gap-2 mt-4 mx-4">
                    <SidebarTrigger className="block lg:hidden" />
                    {breadcrumbs}
                </div>
                <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                    {children}
                </div>
                <AnimatedThemeToggler className="fixed bottom-4 right-4" />
            </main>
        </SidebarProvider>
    );
}
