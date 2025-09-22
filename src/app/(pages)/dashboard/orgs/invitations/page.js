import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireOrganization } from "@/lib/auth-access";
import InviteMemberDialog from "./components/invite-member-dialog";
import InvitationTableRow from "./components/invitation-table-row";
import InvitationStats from "./components/invitation-stats";
import { redirect } from "next/navigation";
import { sortInvitationsByStatus } from "@/lib/invitation-utils";
import { getInvitationPermissions } from "@/hooks/use-invitation-permissions";

export default async function OrganizationInvitationsPage() {
    const organization = await requireOrganization();

    // Obtenir toutes les permissions d'invitation en une seule fois
    const { canRead, canCreate, canCancel, canInvite } =
        await getInvitationPermissions();

    if (!canRead) redirect("/dashboard");

    const invitations = organization.invitations ?? [];
    const sortedInvitations = sortInvitationsByStatus(invitations);

    if (!sortedInvitations.length) {
        return (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucune invitation en cours.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>
                        Gérez les invitations en cours et invitez de nouveaux
                        membres à rejoindre votre organisation.
                        <InvitationStats invitations={invitations} />
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Expire le</TableHead>
                                {(canCreate || canCancel) && (
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedInvitations.map(invitation => (
                                <InvitationTableRow
                                    key={invitation.id}
                                    invitation={invitation}
                                    organizationId={organization.id}
                                    canCreate={canCreate}
                                    canCancel={canCancel}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
