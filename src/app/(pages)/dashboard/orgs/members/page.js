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
import { getMemberPermissions } from "@/hooks/use-member-permissions";
import { requireOrganization, requireUser } from "@/lib/auth-access";
import { redirect } from "next/navigation";
import InviteMemberDialog from "../invitations/components/invite-member-dialog";
import MemberStats from "./components/member-stats";
import MemberTableRow from "./components/member-table-row";

export default async function OrganizationMembersPage() {
    const user = await requireUser();
    const organization = await requireOrganization();

    // Obtenir toutes les permissions de membres en une seule fois
    const { canRead, canUpdate, canDelete, canInvite } =
        await getMemberPermissions();

    if (!canRead) redirect("/dashboard");

    const members = organization.members ?? [];

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
                                {(canUpdate || canDelete) && (
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
                                    organizationId={organization.id}
                                    currentUserId={user.id}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
