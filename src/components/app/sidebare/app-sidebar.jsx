import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar";
import UserButton from "./user-button";

export function AppSidebar({ section }) {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <div className="p-4">
                    <h3 className="font-semibold mb-2">Section: {section}</h3>
                    {section === "app" && (
                        <div>Contenu spécifique à l'app</div>
                    )}
                    {section === "dashboard" && (
                        <div>Contenu spécifique au dashboard</div>
                    )}
                </div>
            </SidebarContent>
            <SidebarFooter>
                <UserButton />
            </SidebarFooter>
        </Sidebar>
    );
}
