import { hasPermissionAction } from "@/actions/organization.action";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@root/prisma/generated";
import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";
import InviteMemberDialog from "../invitations/components/invite-member-dialog";
import MemberItem from "./components/member-item";

const prisma = new PrismaClient();
const MEMBRES_PER_PAGE = 10;

export default async function OrganizationMembersPage({ searchParams }) {
    const t = await getTranslations("organization.members");
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const limit = MEMBRES_PER_PAGE;
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const offset = (page - 1) * MEMBRES_PER_PAGE;
    const sortDirection = resolvedSearchParams?.sortDirection || "asc";

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (!user) notFound();

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const canMemberRead = await hasPermissionAction({
        permissions: { member: ["read"] },
    });
    if (!canMemberRead) notFound();

    const canInvitationCreate = await hasPermissionAction({
        permissions: { invitation: ["create"] },
    });

    const canMemberUpdate = await hasPermissionAction({
        permissions: { member: ["update"] },
    });

    const canMemberDelete = await hasPermissionAction({
        permissions: { member: ["delete"] },
    });

    const whereClause = searchValue
        ? {
              organizationId: activeUserOrganization.id,
              user: {
                  name: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              },
          }
        : {
              organizationId: activeUserOrganization.id,
          };

    const lengthTotalMembres = await prisma.member.count({
        where: whereClause,
    });

    const members = await prisma.member.findMany({
        where: whereClause,
        orderBy: {
            user: {
                name: sortDirection,
            },
        },
        include: {
            user: true,
        },
        skip: offset,
        take: limit,
    });
    const totalPages = Math.ceil(lengthTotalMembres / MEMBRES_PER_PAGE);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
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
                        <>
                            <SearchInput
                                placeholder={t("search_placeholder")}
                            />
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
                            <Pagination totalPages={totalPages} page={page} />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
