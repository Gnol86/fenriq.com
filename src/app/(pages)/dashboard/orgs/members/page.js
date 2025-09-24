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
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InviteMemberDialog from "../invitations/components/invite-member-dialog";
import MemberStats from "./components/member-stats";
import MemberTableRow from "./components/member-table-row";
import { hasPermissionAction } from "@/actions/organization.action";

export default async function OrganizationMembersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canMemberRead = await hasPermissionAction({
        permissions: { member: ["read"] },
    });
    if (!canMemberRead) redirect("/dashboard");

    const canInvitationCreate = await hasPermissionAction({
        permissions: { invitation: ["create"] },
    });

    const canMemberUpdate = await hasPermissionAction({
        permissions: { member: ["update"] },
    });

    const canMemberDelete = await hasPermissionAction({
        permissions: { member: ["delete"] },
    });

    const members = activeUserOrganization
        ? (
              await auth.api.listMembers({
                  headers: await headers(),
              })
          ).members
        : [];

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les membres actifs de votre organisation, leurs
                        rôles et leurs permissions.
                        <MemberStats members={members} />
                    </CardDescription>
                    {canInvitationCreate && (
                        <CardAction>
                            <InviteMemberDialog
                                organizationId={activeUserOrganization.id}
                                organizationName={activeUserOrganization.name}
                            />
                        </CardAction>
                    )}
                </CardHeader>

                <CardContent>
                    <Table>
                        {!members.length && (
                            <TableCaption>
                                Aucun membre dans l&apos;organisation.
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Depuis</TableHead>
                                {(canMemberUpdate || canMemberDelete) && (
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <MemberTableRow
                                    key={member.id}
                                    member={member}
                                    organizationId={activeUserOrganization.id}
                                    currentUserId={user.id}
                                    canUpdate={canMemberUpdate}
                                    canDelete={canMemberDelete}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
