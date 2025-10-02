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
import { getTranslations } from "next-intl/server";

export default async function AdminOrganizationMembersPage({ params }) {
    const { slug } = params;
    const tOrgMembers = await getTranslations("organization.members");
    const tAdminMembers = await getTranslations("admin.org_members");

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
                    <CardTitle>{tOrgMembers("page_title")}</CardTitle>
                    <CardDescription className="flex flex-col gap-2">
                        {tAdminMembers("page_description", {
                            name: organization.name,
                        })}
                        <span className="text-muted-foreground">
                            {tAdminMembers("page_note")}
                        </span>
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
                                {tOrgMembers("no_members")}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>{tOrgMembers("table_user")}</TableHead>
                                <TableHead>{tOrgMembers("table_role")}</TableHead>
                                <TableHead>{tOrgMembers("table_since")}</TableHead>
                                <TableHead className="text-right">
                                    {tAdminMembers("table_actions")}
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
