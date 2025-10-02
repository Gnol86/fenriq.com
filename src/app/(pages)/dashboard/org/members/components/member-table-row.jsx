import { TableCell, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/components/ui/role-badge";
import ImageProfile from "@/components/image-profile";
import { formatDate } from "@/lib/utils";
import MembersActionMenu from "./members-action-menu";
import { useTranslations, useLocale } from "next-intl";

/**
 * Composant ligne de tableau pour afficher un membre
 * Encapsule toute la logique d'affichage d'un membre dans le tableau
 * @param {Object} props
 * @param {Object} props.member - L'objet membre à afficher
 * @param {string} props.organizationId - ID de l'organisation
 * @param {string} props.currentUserId - ID de l'utilisateur actuel
 * @param {boolean} props.canUpdate - Permission de modifier les membres
 * @param {boolean} props.canDelete - Permission de supprimer les membres
 */
export default function MemberTableRow({
    member,
    organizationId,
    currentUserId,
    canUpdate,
    canDelete,
}) {
    const memberRole = member?.role ?? "member";
    const showActions = canUpdate || canDelete;
    const t = useTranslations("organization.members");
    const locale = useLocale();

    return (
        <TableRow>
            {/* Utilisateur avec avatar et informations */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <ImageProfile entity={member?.user} size="sm" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                            {member?.user?.name || t("table_user")}
                        </span>
                        {member?.user?.email ? (
                            <span className="text-xs text-muted-foreground">
                                {member.user.email}
                            </span>
                        ) : null}
                    </div>
                </div>
            </TableCell>

            {/* Rôle du membre */}
            <TableCell>
                <RoleBadge role={memberRole} />
            </TableCell>

            {/* Date d'ajout */}
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {formatDate(member?.createdAt, locale)}
                </span>
            </TableCell>

            {/* Actions (si permissions) */}
            {showActions && (
                <TableCell className="text-right">
                    <MembersActionMenu
                        member={member}
                        memberRole={memberRole}
                        organizationId={organizationId}
                        currentUserId={currentUserId}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}
