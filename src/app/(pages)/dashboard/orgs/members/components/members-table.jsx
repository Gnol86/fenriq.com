import MembersActionMenu from "./members-action-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { defaultRoleLabels } from "./constants";
import { formatMemberSince } from "./utils";
import ImageProfile from "@/components/image-profile";

function sortMembers(members) {
    return [...members].sort((a, b) => {
        const nameA = (a?.user?.name || a?.user?.email || "").toLocaleLowerCase(
            "fr"
        );
        const nameB = (b?.user?.name || b?.user?.email || "").toLocaleLowerCase(
            "fr"
        );
        return nameA.localeCompare(nameB, "fr", { sensitivity: "accent" });
    });
}

export default function MembersTable({
    members,
    organizationId,
    currentUserId,
}) {
    const sortedMembers = sortMembers(members);

    if (!sortedMembers.length) {
        return (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucun membre actif pour le moment.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Depuis</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedMembers.map(member => {
                    const memberRole = member?.role ?? "member";

                    return (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <ImageProfile
                                        user={member?.user}
                                        size="sm"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                            {member?.user?.name ||
                                                "Utilisateur"}
                                        </span>
                                        {member?.user?.email ? (
                                            <span className="text-xs text-muted-foreground">
                                                {member.user.email}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-medium text-foreground">
                                    {defaultRoleLabels[memberRole] ??
                                        memberRole}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {formatMemberSince(member?.createdAt)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <MembersActionMenu
                                    member={member}
                                    memberRole={memberRole}
                                    organizationId={organizationId}
                                    currentUserId={currentUserId}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
