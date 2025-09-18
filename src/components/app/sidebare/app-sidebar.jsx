import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";
import { needUser } from "@/lib/auth";

export async function AppSidebar({ section }) {
    const user = await needUser();
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <div className="p-4">
                    <h3 className="font-semibold mb-2">Section: {section}</h3>
                    {section === "app" && <div>Contenu spécifique à l'app</div>}
                    {section === "dashboard" && (
                        <div>Contenu spécifique au dashboard</div>
                    )}
                </div>
            </SidebarContent>
            <SidebarFooter>
                <UserButton user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
