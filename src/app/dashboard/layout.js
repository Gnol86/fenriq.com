import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideBarContent from "./sidebarcontent/side-bar-content";
import BreadcrumbSlot from "@/components/breadcrumb-slot";

export default async function Layout({ children }) {
    return (
        <SidebarProvider>
            <AppSidebar>
                <SideBarContent />
            </AppSidebar>
            <main className="relative p-0 w-full h-dvh">
                <div className="inline-flex items-center gap-2 mt-4 mx-4">
                    <SidebarTrigger className="lg:hidden" />
                    <BreadcrumbSlot />
                </div>
                <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
