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
import { notFound } from "next/navigation";
import InviteMemberDialog from "./components/invite-member-dialog";
import InvitationItem from "./components/invitation-item";
import React from "react";
import { Mail } from "lucide-react";
import { PrismaClient } from "@/generated/prisma";
import SearchInput from "@/components/search-input";
import { Pagination } from "@/components/pagination";

const prisma = new PrismaClient();
const INVITATIONS_PER_PAGE = 10;

export default async function OrganizationInvitationsPage({ searchParams }) {
    const t = await getTranslations("organization.invitations");
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const limit = INVITATIONS_PER_PAGE;
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const offset = (page - 1) * INVITATIONS_PER_PAGE;

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

    const canInvitationRead = await hasPermissionAction({
        permissions: { invitation: ["read"] },
    });
    if (!canInvitationRead) notFound();

    const canInvitationCreate = await hasPermissionAction({
        permissions: { invitation: ["create"] },
    });

    const canInvitationCancel = await hasPermissionAction({
        permissions: { invitation: ["cancel"] },
    });

    const whereClause = searchValue
        ? {
              organizationId: activeUserOrganization.id,
              email: {
                  contains: searchValue,
                  mode: "insensitive",
              },
          }
        : {
              organizationId: activeUserOrganization.id,
          };

    const lengthTotalInvitations = await prisma.invitation.count({
        where: whereClause,
    });

    const invitations = await prisma.invitation.findMany({
        where: whereClause,
        orderBy: { expiresAt: "desc" },
        skip: offset,
        take: limit,
    });

    const totalPages = Math.ceil(lengthTotalInvitations / INVITATIONS_PER_PAGE);

    // Get the user's locale for date formatting
    const locale = session.user?.locale ?? "fr";

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
                    {!invitations.length ? (
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Mail />
                                </EmptyMedia>
                                <EmptyTitle>{t("no_invitations")}</EmptyTitle>
                                <EmptyDescription>
                                    {t("invite_members_description")}
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
                                {invitations.map((invitation, index) => (
                                    <React.Fragment key={invitation.id}>
                                        <InvitationItem
                                            invitation={invitation}
                                            organizationId={
                                                activeUserOrganization.id
                                            }
                                            canCreate={canInvitationCreate}
                                            canCancel={canInvitationCancel}
                                            locale={locale}
                                        />
                                        {index !== invitations.length - 1 && (
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
