import { headers } from "next/headers";
import BreadcrumbSlot from "@/components/breadcrumb-slot";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SideBarContent from "./sidebarcontent/side-bar-content";

export default async function Layout({ children }) {
    const requestHeaders = await headers();
    const pathname = requestHeaders.get("x-pathname") ?? "";
    const isChecklistBuilderPage =
        pathname === "/dashboard/project/charroi/checklists/new" ||
        /^\/dashboard\/project\/charroi\/checklists\/[^/]+\/edit$/.test(pathname);

    return (
        <>
            <AppSidebar>
                <SideBarContent />
            </AppSidebar>
            <main className="relative h-dvh w-full p-0">
                <div className="mx-4 mt-4 inline-flex items-center gap-2">
                    <SidebarTrigger />
                    <BreadcrumbSlot />
                </div>
                <div
                    className={`mx-auto flex flex-col gap-6 p-6 ${
                        isChecklistBuilderPage ? "max-w-[1440px]" : "max-w-4xl"
                    }`}
                >
                    {children}
                </div>
            </main>
        </>
    );
}
