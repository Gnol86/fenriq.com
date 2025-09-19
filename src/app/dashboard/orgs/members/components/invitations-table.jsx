"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { defaultRoleLabels } from "./constants";
import { formatMemberSince } from "./utils";

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

export default function InvitationsTable({ invitations }) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => {
          const statusLabel = formatInvitationStatus(invitation);
          return (
            <TableRow key={invitation.id}>
              <TableCell>
                <span className="text-sm text-foreground">
                  {invitation.email}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-foreground">
                  {defaultRoleLabels[invitation.role] ?? invitation.role}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    getStatusBadgeClasses(statusLabel),
                  )}
                >
                  {statusLabel}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {invitation.expiresAt
                    ? formatMemberSince(invitation.expiresAt)
                    : "-"}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
