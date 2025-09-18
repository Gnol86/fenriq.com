import { AppSidebar } from "@/app/(app)/_sidebare/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { needUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
    const user = await needUser();

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="relative p-10 w-full h-dvh">
                <SidebarTrigger className={"absolute top-2 left-2"} />
                {children}
            </main>
        </SidebarProvider>
    );
}
