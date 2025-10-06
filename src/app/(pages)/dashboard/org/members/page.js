import { hasPermissionAction } from "@/actions/organization.action";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InviteMemberDialog from "../invitations/components/invite-member-dialog";
import MemberItem from "./components/member-item";
import MemberStats from "./components/member-stats";
import React from "react";
import { Users } from "lucide-react";

export default async function OrganizationMembersPage() {
    const t = await getTranslations("organization.members");
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
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>
                        {t("page_description")}
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
                    {!members.length ? (
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Users />
                                </EmptyMedia>
                                <EmptyTitle>{t("no_members")}</EmptyTitle>
                                <EmptyDescription>
                                    {t("invit_members")}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <InviteMemberDialog
                                    organizationId={activeUserOrganization.id}
                                    organizationName={
                                        activeUserOrganization.name
                                    }
                                />
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <ItemGroup>
                            {members.map((member, index) => (
                                <React.Fragment key={member.id}>
                                    <MemberItem
                                        member={member}
                                        organizationId={
                                            activeUserOrganization.id
                                        }
                                        currentUserId={user.id}
                                        canUpdate={canMemberUpdate}
                                        canDelete={canMemberDelete}
                                    />
                                    {index !== members.length - 1 && (
                                        <ItemSeparator />
                                    )}
                                </React.Fragment>
                            ))}
                        </ItemGroup>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
