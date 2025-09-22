import MembersActionMenu from "@/app/(pages)/dashboard/orgs/members/components/members-action-menu";
import ImageProfile from "@/components/image-profile";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    hasGlobalPermission,
    requireOrganization,
    requireUser,
} from "@/lib/auth-access";
import { defaultRoleLabels } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import InviteMemberDialog from "../invitations/components/invite-member-dialog";

export default async function OrganizationMembersPage() {
    const user = await requireUser();
    const organization = await requireOrganization();

    const can = await hasGlobalPermission({
        member: ["read"],
    });
    if (!can) redirect("/dashboard");

    const canInvite = await hasGlobalPermission({
        invitation: ["create"],
    });

    const canUpdate = await hasGlobalPermission({
        member: ["update"],
    });

    const canDelete = await hasGlobalPermission({
        member: ["delete"],
    });

    const members = organization.members ?? [];

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les membres actifs de votre organisation, leurs
                        rôles et leurs permissions.
                        {members.length > 0 && (
                            <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
                                {members.length} membre
                                {members.length > 1 ? "s" : ""} actif
                                {members.length > 1 ? "s" : ""}
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
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Depuis</TableHead>
                                {(canUpdate || canDelete) && (
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
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
                                                {defaultRoleLabels[
                                                    memberRole
                                                ] ?? memberRole}
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
                                                    organizationId={
                                                        organization.id
                                                    }
                                                    currentUserId={user.id}
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
                </CardContent>
            </Card>
        </div>
    );
}
