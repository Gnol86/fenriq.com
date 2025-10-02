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
import InvitationTableRow from "./invitation-table-row";
import { useTranslations, useLocale } from "next-intl";

export default function InvitationFilter({
    invitations,
    canCreate,
    canCancel,
    organizationId,
}) {
    const t = useTranslations("organization.invitations.filter");
    const locale = useLocale();
    const [showAll, setShowAll] = useState(false);

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
                        ? t("showing_all", { count: totalCount })
                        : t("showing_pending", { count: pendingCount })}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? t("show_pending") : t("show_all")}
                </Button>
            </div>

            {/* Table des invitations */}
            <Table>
                {!filteredInvitations.length && (
                    <TableCaption>
                        {showAll ? t("no_invitations") : t("no_pending_invitations")}
                    </TableCaption>
                )}
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("table_email")}</TableHead>
                        <TableHead>{t("table_role")}</TableHead>
                        <TableHead>{t("table_status")}</TableHead>
                        <TableHead>{t("table_expires")}</TableHead>
                        {(canCreate || canCancel) && (
                            <TableHead className="text-right">{t("table_action")}</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvitations.map(invitation => (
                        <InvitationTableRow
                            key={invitation.id}
                            invitation={invitation}
                            organizationId={organizationId}
                            canCreate={canCreate}
                            canCancel={canCancel}
                            locale={locale}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
