import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireOrganization, hasGlobalPermission } from "@/lib/auth-access";
import InvitationsTable from "../../../../../components/dashboard/invitations-table";
import InviteMemberDialog from "../../../../../components/dashboard/invite-member-dialog";
import { redirect } from "next/navigation";

export default async function OrganizationInvitationsPage() {
    const organization = await requireOrganization();

    const can = await hasGlobalPermission({
        invitation: ["read"],
    });
    if (!can) redirect("/dashboard");

    const canInvite = await hasGlobalPermission({
        invitation: ["create"],
    });

    const invitations = organization.invitations ?? [];
    const pendingInvitationsCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;
    const totalInvitationsCount = invitations.length;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>
                        Gérez les invitations en cours et invitez de nouveaux
                        membres à rejoindre votre organisation.
                        {pendingInvitationsCount > 0 && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400">
                                {pendingInvitationsCount} invitation
                                {pendingInvitationsCount > 1 ? "s" : ""} en
                                attente
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
                    <InvitationsTable
                        invitations={invitations}
                        organizationId={organization.id}
                    />

                    {totalInvitationsCount > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Total : {totalInvitationsCount} invitation
                            {totalInvitationsCount > 1 ? "s" : ""}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
