import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser, requireOrganization } from "@/lib/data-access";
import MembersTable from "./components/members-table";
import InvitationsTable from "./components/invitations-table";

export default async function OrganizationMembersPage() {
    const user = await requireUser();
    const organization = await requireOrganization();

    const members = organization.members ?? [];
    const invitations = organization.invitations ?? [];
    const pendingInvitationsCount = invitations.filter(
        invitation => invitation.status === "pending"
    ).length;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les accès, invitez de nouveaux membres et suivez
                        les invitations en cours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="members"
                        className="flex flex-col gap-4"
                    >
                        <TabsList>
                            <TabsTrigger value="members">
                                Membres actifs{" "}
                                <span className="text-xs text-muted-foreground">
                                    {members.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="invitations">
                                Invitations{" "}
                                {pendingInvitationsCount && (
                                    <span className="text-xs text-muted-foreground">
                                        {pendingInvitationsCount} en attente
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="members"
                            className="flex flex-col gap-4"
                        >
                            <MembersTable
                                members={members}
                                organizationId={organization.id}
                                currentUserId={user?.id ?? null}
                            />
                        </TabsContent>
                        <TabsContent
                            value="invitations"
                            className="flex flex-col gap-4"
                        >
                            <InvitationsTable
                                invitations={invitations}
                                organizationId={organization.id}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
