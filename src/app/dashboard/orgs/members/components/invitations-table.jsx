"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { defaultRoleLabels } from "./constants";
import { formatMemberSince } from "./utils";
import { Loader2, MoreHorizontal } from "lucide-react";

const invitationStatusLabels = {
    accepted: "Acceptée",
    pending: "En attente",
    canceled: "Annulée",
    rejected: "Refusée",
};

function formatInvitationStatus(invitation) {
    if (!invitation) {
        return "-";
    }

    if (
        invitation.status === "pending" &&
        invitation.expiresAt &&
        new Date(invitation.expiresAt).getTime() < Date.now()
    ) {
        return "Périmée";
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

export default function InvitationsTable({
    invitations,
    onCopyLink,
    onResend,
    onCancel,
    resendingInvitationId,
    cancelingInvitationId,
}) {
    if (!invitations.length) {
        return (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucune invitation en cours.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Expire le</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invitations.map(invitation => {
                    const statusLabel = formatInvitationStatus(invitation);
                    const isResending =
                        resendingInvitationId === invitation.id;
                    const isCanceling =
                        cancelingInvitationId === invitation.id;
                    return (
                        <TableRow key={invitation.id}>
                            <TableCell>
                                <span className="text-sm text-foreground">
                                    {invitation.email}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-medium text-foreground">
                                    {defaultRoleLabels[invitation.role] ??
                                        invitation.role}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                        getStatusBadgeClasses(statusLabel)
                                    )}
                                >
                                    {statusLabel}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {invitation.expiresAt
                                        ? formatMemberSince(
                                              invitation.expiresAt
                                          )
                                        : "-"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            aria-label="Actions sur l'invitation"
                                        >
                                            <MoreHorizontal
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onSelect={event => {
                                                event.preventDefault();
                                                onCopyLink?.(invitation);
                                            }}
                                        >
                                            Copier le lien
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={event => {
                                                event.preventDefault();
                                                onResend?.(invitation);
                                            }}
                                            disabled={isResending || isCanceling}
                                        >
                                            {isResending && (
                                                <Loader2
                                                    className="mr-2 h-4 w-4 animate-spin"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            Renvoyer
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={event => {
                                                event.preventDefault();
                                                onCancel?.(invitation);
                                            }}
                                            disabled={isCanceling}
                                        >
                                            {isCanceling && (
                                                <Loader2
                                                    className="mr-2 h-4 w-4 animate-spin"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
