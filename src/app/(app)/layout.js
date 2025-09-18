import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { needUser } from "@/lib/auth";

export default async function Layout({ children, sidebar }) {
    const user = await needUser();

    return (
        <SidebarProvider>
            {sidebar}
            <main className="relative p-10 w-full h-dvh">
                <SidebarTrigger className="absolute top-2 left-2" />
                {children}
            </main>
        </SidebarProvider>
    );
}
