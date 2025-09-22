import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    requireUser,
    requireOrganization,
    hasGlobalPermission,
} from "@/lib/auth-access";
import MembersTable from "../../../../../components/dashboard/members-table";
import InviteMemberDialog from "../../../../../components/dashboard/invite-member-dialog";
import { redirect } from "next/navigation";

export default async function OrganizationMembersPage() {
    const user = await requireUser();
    const organization = await requireOrganization();

    const can = await hasGlobalPermission({
        member: ["read"],
    });
    if (!can) redirect("/dashboard");

    const canInvite = await hasGlobalPermission({
        invitation: ["create"],
    });

    const members = organization.members ?? [];

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les membres actifs de votre organisation, leurs
                        rôles et leurs permissions.
                        {members.length > 0 && (
                            <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
                                {members.length} membre
                                {members.length > 1 ? "s" : ""} actif
                                {members.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </CardDescription>
                    {canInvite && (
                        <CardAction>
                            <InviteMemberDialog
                                organizationId={organization.id}
                                organizationName={organization.name}
                            />
                        </CardAction>
                    )}
                </CardHeader>

                <CardContent>
                    <MembersTable
                        members={members}
                        organizationId={organization.id}
                        currentUserId={user?.id ?? null}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
