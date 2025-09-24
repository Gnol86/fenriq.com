import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import InviteMemberDialog from "./components/invite-member-dialog";
import InvitationStats from "./components/invitation-stats";
import InvitationFilter from "./components/invitation-filter";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sortInvitationsByStatus } from "@/lib/invitation-utils";
import { hasPermissionAction } from "@/actions/organization.action";

export default async function OrganizationInvitationsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canInvitationRead = await hasPermissionAction({
        permissions: { invitation: ["read"] },
    });
    if (!canInvitationRead) redirect("/dashboard");

    const canInvitationCreate = await hasPermissionAction({
        permissions: { invitation: ["create"] },
    });

    const canInvitationCancel = await hasPermissionAction({
        permissions: { invitation: ["cancel"] },
    });

    const invitations = activeUserOrganization
        ? await auth.api.listInvitations({
              headers: await headers(),
          })
        : [];

    console.log(invitations);

    const sortedInvitations = sortInvitationsByStatus(invitations);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>
                        Gérez les invitations en cours et invitez de nouveaux
                        membres à rejoindre votre organisation.
                        <InvitationStats invitations={invitations} />
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
                    <InvitationFilter
                        invitations={sortedInvitations}
                        canCreate={canInvitationCreate}
                        canCancel={canInvitationCancel}
                        organizationId={activeUserOrganization.id}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
