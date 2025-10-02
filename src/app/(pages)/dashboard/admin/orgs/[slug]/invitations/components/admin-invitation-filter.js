"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import AdminInvitationTableRow from "./admin-invitation-table-row";
import { useTranslations, useLocale } from "next-intl";

export default function AdminInvitationFilter({
    invitations,
    organizationId,
    organizationSlug,
}) {
    const [showAll, setShowAll] = useState(false);
    const tAdminInvitations = useTranslations("admin.org_invitations");
    const tFilter = useTranslations("organization.invitations.filter");
    const tInvitations = useTranslations("organization.invitations");
    const locale = useLocale();

    // Filtrer les invitations selon l'état du toggle
    const filteredInvitations = showAll
        ? invitations
        : invitations.filter(invitation => invitation.status === "pending");

    const pendingCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;
    const totalCount = invitations.length;

    return (
        <div className="flex flex-col gap-4">
            {/* Bouton de toggle */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {showAll
                        ? tAdminInvitations("status_all", {
                              count: totalCount,
                          })
                        : tAdminInvitations("status_pending", {
                              count: pendingCount,
                          })}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? tAdminInvitations("toggle_show_pending")
                        : tAdminInvitations("toggle_show_all")}
                </Button>
            </div>

            {/* Table des invitations */}
            <Table>
                {!filteredInvitations.length && (
                    <TableCaption>
                        {showAll
                            ? tAdminInvitations("empty_all")
                            : tAdminInvitations("empty_pending")}
                    </TableCaption>
                )}
                <TableHeader>
                    <TableRow>
                        <TableHead>{tFilter("table_email")}</TableHead>
                        <TableHead>{tFilter("table_role")}</TableHead>
                        <TableHead>{tFilter("table_status")}</TableHead>
                        <TableHead>{tInvitations("table_invited_by")}</TableHead>
                        <TableHead>{tFilter("table_expires")}</TableHead>
                        <TableHead className="text-right">
                            {tAdminInvitations("action_menu_label")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvitations.map(invitation => (
                        <AdminInvitationTableRow
                            key={invitation.id}
                            invitation={invitation}
                            organizationId={organizationId}
                            organizationSlug={organizationSlug}
                            locale={locale}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
