"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
    Calendar,
    Building2,
    Users,
    Globe,
    FileText,
    HatGlasses,
} from "lucide-react";
import OrganizationActionMenu from "./organization-action-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

// Composant pour afficher un membre avec bouton d'usurpation
function MemberRow({ member, currentUserId }) {
    const router = useRouter();
    const tMembers = useTranslations("admin.org_members");
    const tDetails = useTranslations("admin.org_details");
    const fallbackName = member.user?.name || member.user?.email || tDetails("fallback_user");

    const handleImpersonateUser = async () => {
        try {
            // Utiliser authClient directement au lieu d'une server action
            const result = await authClient.admin.impersonateUser({
                userId: member.userId,
            });

            if (result.data?.session) {
                toast.success(
                    tMembers("success_impersonate", { name: fallbackName })
                );
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Erreur lors de l'usurpation:", error);
            toast.error(tMembers("impersonate_error"));
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {fallbackName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {member.user?.email}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                    {member.role}
                </Badge>
                {member.userId !== currentUserId ? (
                    <Button
                        variant="outline"
                        onClick={handleImpersonateUser}
                        size="sm"
                    >
                        <HatGlasses className="h-4 w-4 mr-2" />
                        {tMembers("owners_impersonate")}
                    </Button>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        {tMembers("owners_badge_self")}
                    </Badge>
                )}
            </div>
        </div>
    );
}

export default function OrganizationDetailsCollapse({
    organization,
    currentUserId,
}) {
    const tDetails = useTranslations("admin.org_details");
    const tMembers = useTranslations("admin.org_members");
    const locale = useLocale();

    const formatDescription = description => {
        if (!description) return tDetails("field_description_empty");
        return description.length > 100
            ? description.substring(0, 100) + "..."
            : description;
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between w-full ">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Building2 className="h-4 w-4 mt-0.25" />
                            {tDetails("details_title")}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tDetails("field_id")}
                            </div>
                            <p className="font-mono text-xs break-all">
                                {organization.id}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tDetails("field_name")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {organization.name}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tDetails("field_slug")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {organization.slug}
                            </div>
                        </div>
                        {organization.description && (
                            <div className="flex gap-1">
                                <div className="font-medium text-muted-foreground">
                                    {tDetails("field_description")}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {formatDescription(
                                        organization.description
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tDetails("field_created")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(organization.createdAt, locale)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between w-full ">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Users className="h-4 w-4 mt-0.25" />
                            {tMembers("owners_title", {
                                count:
                                    organization.members?.filter(
                                        member => member.role === "owner"
                                    ).length || 0,
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        {!organization.members?.filter(
                            member => member.role === "owner"
                        ).length ? (
                            <div className="text-center py-4 text-muted-foreground">
                                {tMembers("owners_empty")}
                            </div>
                        ) : (
                            <ScrollArea onCard className="max-h-40">
                                <div className="flex flex-col gap-2">
                                    {organization.members
                                        .filter(
                                            member => member.role === "owner"
                                        )
                                        .map(member => (
                                            <MemberRow
                                                key={member.id}
                                                member={member}
                                                currentUserId={currentUserId}
                                            />
                                        ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>
            <OrganizationActionMenu organization={organization} />
        </div>
    );
}
