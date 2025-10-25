import BreadcrumbSlot from "@/components/breadcrumb-slot";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarToggler } from "@root/src/components/sidebar/sidebar-toggler";
import SideBarContent from "./sidebarcontent/side-bar-content";

export default async function Layout({ children }) {
    return (
        <>
            <AppSidebar>
                <SideBarContent />
            </AppSidebar>
            <main className="relative h-dvh w-full p-0">
                <div className="mx-4 mt-4 inline-flex items-center gap-2">
                    <SidebarTrigger />
                    <SidebarToggler />
                    <BreadcrumbSlot />
                </div>
                <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                    {children}
                </div>
            </main>
        </>
    );
}
