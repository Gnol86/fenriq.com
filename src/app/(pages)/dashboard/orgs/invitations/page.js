import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import InvitationsActionMenu from "@/app/(pages)/dashboard/orgs/invitations/components/invitations-action-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireOrganization, hasGlobalPermission } from "@/lib/auth-access";
import InviteMemberDialog from "./components/invite-member-dialog";
import { redirect } from "next/navigation";
import { defaultRoleLabels, invitationStatusLabels } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

function formatInvitationStatus(invitation) {
    if (!invitation) {
        return "-";
    }

    if (
        invitation.status === "pending" &&
        invitation.expiresAt &&
        new Date(invitation.expiresAt).getTime() < Date.now()
    ) {
        return invitationStatusLabels.outdated;
    }

    return invitationStatusLabels[invitation.status] ?? invitation.status;
}

function getStatusBadgeClasses(statusLabel) {
    switch (statusLabel) {
        case "Acceptée":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
        case "En attente":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
        case "Périmée":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200";
        case "Annulée":
        case "Refusée":
            return "bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function sortInvitations(invitations) {
    const statusOrder = {
        pending: 0,
        accepted: 1,
        rejected: 2,
        canceled: 3,
    };

    return [...invitations].sort((a, b) => {
        const orderA = statusOrder[a.status] ?? Number.MAX_SAFE_INTEGER;
        const orderB = statusOrder[b.status] ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        return 0;
    });
}

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

    const sortedInvitations = sortInvitations(invitations);

    const canCreate = await hasGlobalPermission({
        invitation: ["create"],
    });

    const canCancel = await hasGlobalPermission({
        invitation: ["cancel"],
    });

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
                        {pendingInvitationsCount > 0 && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400">
                                {pendingInvitationsCount} invitation
                                {pendingInvitationsCount > 1 ? "s" : ""} en
                                attente
                            </span>
                        )}
                        {totalInvitationsCount > 0 && (
                            <span className="block mt-1 text-muted-foreground">
                                Total : {totalInvitationsCount} invitation
                                {totalInvitationsCount > 1 ? "s" : ""}
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
                            {sortedInvitations.map(invitation => {
                                const statusLabel =
                                    formatInvitationStatus(invitation);
                                const invitationRole =
                                    invitation.role ?? "member";

                                return (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            <span className="text-sm text-foreground">
                                                {invitation.email}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-foreground">
                                                {defaultRoleLabels[
                                                    invitationRole
                                                ] ?? invitationRole}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                                    getStatusBadgeClasses(
                                                        statusLabel
                                                    )
                                                )}
                                            >
                                                {statusLabel}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {invitation.expiresAt
                                                    ? formatDate(
                                                          invitation.expiresAt
                                                      )
                                                    : "-"}
                                            </span>
                                        </TableCell>
                                        {(canCreate || canCancel) && (
                                            <TableCell className="text-right">
                                                <InvitationsActionMenu
                                                    invitation={invitation}
                                                    organizationId={
                                                        organization.id
                                                    }
                                                    canCreate={canCreate}
                                                    canCancel={canCancel}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
