import {
    BookOpen,
    CreditCard,
    FolderTree,
    Languages,
    RefreshCw,
    Rocket,
    Settings2,
    ShieldCheck,
    TerminalSquare,
    Users,
    Workflow,
} from "lucide-react";
import Link from "next/link";
import { getMessages } from "next-intl/server";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const SECTION_ICONS = {
    overview: BookOpen,
    installation: Rocket,
    commands: TerminalSquare,
    configuration: Settings2,
    structure: FolderTree,
    "access-control": ShieldCheck,
    organizations: Users,
    "server-actions": Workflow,
    "billing-email": CreditCard,
    i18n: Languages,
    updates: RefreshCw,
};

export default async function SideBarContent() {
    const messages = await getMessages();
    const documentation = messages.project.app.index;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{documentation.sidebar_label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {documentation.section_order.map(sectionId => {
                        const section = documentation.sections[sectionId];
                        const Icon = SECTION_ICONS[sectionId] ?? BookOpen;

                        return (
                            <SidebarMenuItem key={sectionId}>
                                <SidebarMenuButton render={<Link href={`/app#${sectionId}`} />}>
                                    <Icon className="opacity-60" />
                                    {section.nav_label}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
