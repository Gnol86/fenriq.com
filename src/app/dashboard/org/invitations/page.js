import { hasPermissionAction } from "@/actions/organization.action";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";
import InvitationItem from "./components/invitation-item";
import InviteMemberDialog from "./components/invite-member-dialog";
import ToggleViewButton from "./components/toggle-view-button";

const prisma = new PrismaClient();
const INVITATIONS_PER_PAGE = 10;

export default async function OrganizationInvitationsPage({ searchParams }) {
    const t = await getTranslations("organization.invitations");
    const resolvedSearchParams = await searchParams;
    const rawSearchParam = resolvedSearchParams?.search;
    const searchValue = Array.isArray(rawSearchParam)
        ? (rawSearchParam[rawSearchParam.length - 1] ?? "")
        : (rawSearchParam ?? "");
    const rawPageParam = resolvedSearchParams?.page;
    const pageParam = Array.isArray(rawPageParam)
        ? (rawPageParam[rawPageParam.length - 1] ?? "1")
        : (rawPageParam ?? "1");
    const viewParam = resolvedSearchParams?.view;
    const currentView = Array.isArray(viewParam)
        ? viewParam[viewParam.length - 1]
        : viewParam;
    const isShowingAllInvitations = currentView === "all";
    const limit = INVITATIONS_PER_PAGE;
    const page = parseInt(pageParam, 10);
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

    const whereClause = {
        organizationId: activeUserOrganization.id,
        ...(isShowingAllInvitations ? {} : { status: "pending" }),
        ...(searchValue
            ? {
                  email: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              }
            : {}),
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

    const toggleButtonLabel = isShowingAllInvitations
        ? t("filter.show_pending")
        : t("filter.show_all");
    const filterStatusMessage = t(
        isShowingAllInvitations
            ? "filter.showing_all"
            : "filter.showing_pending",
        { count: lengthTotalInvitations }
    );
    const emptyStateTitleKey = searchValue
        ? "filter.no_invitations"
        : isShowingAllInvitations
          ? "filter.no_invitations"
          : "filter.no_pending_invitations";
    const emptyStateTitle = t(emptyStateTitleKey);

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
                    <ButtonGroup className="w-full mb-4">
                        <SearchInput placeholder={t("search_placeholder")} />
                        <ToggleViewButton label={toggleButtonLabel} />
                    </ButtonGroup>
                    {!invitations.length ? (
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Mail />
                                </EmptyMedia>
                                <EmptyTitle>{emptyStateTitle}</EmptyTitle>
                                <EmptyDescription>
                                    {t("invite_members_description")}
                                </EmptyDescription>
                            </EmptyHeader>
                            {canInvitationCreate && (
                                <EmptyContent>
                                    <InviteMemberDialog
                                        organizationId={
                                            activeUserOrganization.id
                                        }
                                        organizationName={
                                            activeUserOrganization.name
                                        }
                                    />
                                </EmptyContent>
                            )}
                        </Empty>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {filterStatusMessage}
                            </p>
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
