"use client";

import { Badge } from "@/components/ui/badge";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInvitationDisplayStatus } from "@/lib/invitation-utils";
import { formatDate } from "@/lib/utils";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import InvitationsActionMenu from "./invitations-action-menu";

export default function InvitationItem({
    invitation,
    organizationId,
    canCreate,
    canCancel,
    locale,
}) {
    const tRoles = useTranslations("roles");
    const tInvitationStatus = useTranslations("invitation_status");

    const statusKey = getInvitationDisplayStatus(invitation);
    const normalizedStatusKey =
        statusKey === "unknown" ? invitation?.status ?? "pending" : statusKey;

    let statusLabel = normalizedStatusKey;
    try {
        statusLabel = tInvitationStatus(normalizedStatusKey);
    } catch (error) {
        statusLabel = normalizedStatusKey;
    }

    const invitationRole = invitation.role ?? "member";
    const roleLabel = tRoles(invitationRole);
    const showActions = canCreate || canCancel;

    return (
        <Item>
            <ItemMedia>
                <div className="flex size-10 items-center justify-center rounded-full border bg-muted">
                    <Mail className="size-4" />
                </div>
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    {invitation.email}
                    {invitationRole !== "member" && (
                        <Badge>{roleLabel}</Badge>
                    )}
                    <StatusBadge status={normalizedStatusKey} variant="invitation">
                        {statusLabel}
                    </StatusBadge>
                </ItemTitle>
                <ItemDescription>
                    {invitation.expiresAt
                        ? formatDate(invitation.expiresAt, locale)
                        : "-"}
                </ItemDescription>
            </ItemContent>
            {showActions && (
                <ItemActions>
                    <InvitationsActionMenu
                        invitation={invitation}
                        organizationId={organizationId}
                        canCreate={canCreate}
                        canCancel={canCancel}
                    />
                </ItemActions>
            )}
        </Item>
    );
}
