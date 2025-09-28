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
import { notFound } from "next/navigation";
import AdminInviteMemberDialog from "./components/admin-invite-member-dialog";
import AdminMemberStats from "./components/admin-member-stats";
import AdminMemberTableRow from "./components/admin-member-table-row";
import { getOrganizationBySlugAsAdminAction } from "@/actions/admin.action";

export default async function AdminOrganizationMembersPage({ params }) {
    const { slug } = params;

    const organizationResult = await getOrganizationBySlugAsAdminAction({
        slug,
    });

    if (!organizationResult || organizationResult.error) {
        notFound();
    }

    const organization = organizationResult;
    const members = organization.members || [];

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les membres de l&apos;organisation{" "}
                        {organization.name}, leurs rôles et leurs permissions.
                        En tant qu&apos;administrateur, vous avez tous les
                        droits sur cette organisation.
                        <AdminMemberStats members={members} />
                    </CardDescription>
                    <CardAction>
                        <AdminInviteMemberDialog
                            organizationId={organization.id}
                            organizationName={organization.name}
                        />
                    </CardAction>
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
                                <TableHead className="text-right">
                                    Actions Admin
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <AdminMemberTableRow
                                    key={member.id}
                                    member={member}
                                    organizationId={organization.id}
                                    organizationSlug={organization.slug}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
