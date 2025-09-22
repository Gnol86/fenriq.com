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
import ImageProfile from "@/components/image-profile";
import { hasGlobalPermission } from "@/lib/auth-access";
import { formatDate } from "@/lib/utils";

export default async function MembersTable({
    members,
    organizationId,
    currentUserId,
}) {
    const canUpdate = await hasGlobalPermission({
        member: ["update"],
    });

    const canDelete = await hasGlobalPermission({
        member: ["delete"],
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Depuis</TableHead>
                    {(canUpdate || canDelete) && (
                        <TableHead className="text-right">Action</TableHead>
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map(member => {
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
                                    {formatDate(member?.createdAt)}
                                </span>
                            </TableCell>
                            {(canUpdate || canDelete) && (
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
                })}
            </TableBody>
        </Table>
    );
}
