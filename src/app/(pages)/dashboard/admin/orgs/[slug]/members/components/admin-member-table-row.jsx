import { TableCell, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/components/ui/role-badge";
import ImageProfile from "@/components/image-profile";
import { formatDate } from "@/lib/utils";
import AdminMembersActionMenu from "./admin-members-action-menu";

/**
 * Composant ligne de tableau pour afficher un membre (version admin)
 * Encapsule toute la logique d'affichage d'un membre dans le tableau admin
 * @param {Object} props
 * @param {Object} props.member - L'objet membre à afficher
 * @param {string} props.organizationId - ID de l'organisation
 * @param {string} props.organizationSlug - Slug de l'organisation
 */
export default function AdminMemberTableRow({
    member,
    organizationId,
    organizationSlug,
}) {
    const memberRole = member?.role ?? "member";

    return (
        <TableRow>
            {/* Utilisateur avec avatar et informations */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <ImageProfile entity={member?.user} size="sm" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                            {member?.user?.name || "Utilisateur"}
                        </span>
                        {member?.user?.email ? (
                            <span className="text-xs text-muted-foreground">
                                {member.user.email}
                            </span>
                        ) : null}
                        <span className="text-xs text-blue-600">
                            ID: {member?.user?.id}
                        </span>
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
                    {formatDate(member?.createdAt)}
                </span>
            </TableCell>

            {/* Actions Admin */}
            <TableCell className="text-right">
                <AdminMembersActionMenu
                    member={member}
                    memberRole={memberRole}
                    organizationId={organizationId}
                    organizationSlug={organizationSlug}
                />
            </TableCell>
        </TableRow>
    );
}
