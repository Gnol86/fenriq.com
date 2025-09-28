import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import AdminInviteMemberDialog from "../members/components/admin-invite-member-dialog";
import AdminInvitationStats from "./components/admin-invitation-stats";
import AdminInvitationFilter from "./components/admin-invitation-filter";
import { notFound } from "next/navigation";
import {
    getOrganizationBySlugAsAdminAction,
    listOrganizationInvitationsAsAdminAction,
} from "@/actions/admin.action";
import { sortInvitationsByStatus } from "@/lib/invitation-utils";

export default async function AdminOrganizationInvitationsPage({ params }) {
    const { slug } = params;

    const organizationResult = await getOrganizationBySlugAsAdminAction({
        slug,
    });

    if (!organizationResult || organizationResult.error) {
        notFound();
    }

    const organization = organizationResult;

    const invitationsResult = await listOrganizationInvitationsAsAdminAction({
        organizationId: organization.id,
    });

    const invitations = invitationsResult || [];
    const sortedInvitations = sortInvitationsByStatus(invitations);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>
                        Gérez les invitations de l&apos;organisation{" "}
                        {organization.name}. En tant qu&apos;administrateur,
                        vous pouvez inviter de nouveaux membres et gérer toutes
                        les invitations en cours.
                        <AdminInvitationStats invitations={invitations} />
                    </CardDescription>
                    <CardAction>
                        <AdminInviteMemberDialog
                            organizationId={organization.id}
                            organizationName={organization.name}
                        />
                    </CardAction>
                </CardHeader>

                <CardContent>
                    <AdminInvitationFilter
                        invitations={sortedInvitations}
                        organizationId={organization.id}
                        organizationSlug={organization.slug}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
