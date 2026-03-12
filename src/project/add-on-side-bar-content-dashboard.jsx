import { ClipboardCheck, FileText, Tags, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ActiveSidebarLink } from "@/components/sidebar/active-sidebar-link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { checkPermission } from "@/lib/access-control";

export default async function AddOnSideBarContentDashboard() {
    const t = await getTranslations("project.charroi.sidebar");
    const [
        canReadVehicles,
        canReadChecklists,
        canReadCategories,
        canReadSubscriptions,
        canReadSubmissions,
    ] = await Promise.all([
        checkPermission({
            permissions: { vehicle: ["read"] },
        }),
        checkPermission({
            permissions: { checklist: ["read"] },
        }),
        checkPermission({
            permissions: { checklistCategory: ["read"] },
        }),
        checkPermission({
            permissions: { checklistSubscription: ["read"] },
        }),
        checkPermission({
            permissions: { checklistSubmission: ["read"] },
        }),
    ]);

    if (
        !canReadVehicles &&
        !canReadChecklists &&
        !canReadCategories &&
        !canReadSubscriptions &&
        !canReadSubmissions
    ) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="uppercase">{t("group_label")}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {canReadVehicles && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/project/charroi/vehicles">
                                <Truck className="opacity-60" />
                                <span>{t("vehicles")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                    {canReadChecklists && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/project/charroi/checklists">
                                <ClipboardCheck className="opacity-60" />
                                <span>{t("checklists")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                    {canReadCategories && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/project/charroi/categories">
                                <Tags className="opacity-60" />
                                <span>{t("categories")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                    {canReadSubscriptions && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/project/charroi/subscriptions">
                                <FileText className="opacity-60" />
                                <span>{t("subscriptions")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                    {canReadSubmissions && (
                        <SidebarMenuItem>
                            <ActiveSidebarLink href="/dashboard/project/charroi/submissions">
                                <FileText className="opacity-60" />
                                <span>{t("submissions")}</span>
                            </ActiveSidebarLink>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
