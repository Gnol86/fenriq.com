import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import React from "react";
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
import { checkPermission, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import InvitationItem from "./components/invitation-item";
import InviteMemberDialog from "./components/invite-member-dialog";
import ToggleViewButton from "./components/toggle-view-button";

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
    const currentView = Array.isArray(viewParam) ? viewParam[viewParam.length - 1] : viewParam;
    const isShowingAllInvitations = currentView === "all";
    const limit = INVITATIONS_PER_PAGE;
    const page = parseInt(pageParam, 10);
    const offset = (page - 1) * INVITATIONS_PER_PAGE;

    // Vérifie les permissions et récupère les données nécessaires
    const { user, organization } = await requirePermission({
        permissions: { invitation: ["read"] },
    });

    // Vérifie les permissions pour l'UI conditionnelle
    const canInvitationCreate = await checkPermission({
        permissions: { invitation: ["create"] },
    });

    const canInvitationCancel = await checkPermission({
        permissions: { invitation: ["cancel"] },
    });

    const whereClause = {
        organizationId: organization.id,
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
    const locale = user.locale ?? "fr";

    const toggleButtonLabel = isShowingAllInvitations
        ? t("filter.show_pending")
        : t("filter.show_all");
    const filterStatusMessage = t(
        isShowingAllInvitations ? "filter.showing_all" : "filter.showing_pending",
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
                                organizationId={organization.id}
                                organizationName={organization.name}
                            />
                        </CardAction>
                    )}
                </CardHeader>

                <CardContent>
                    <ButtonGroup className="mb-4 w-full">
                        <SearchInput
                            placeholder={t("search_placeholder")}
                            initialValue={searchValue}
                            searchParams={resolvedSearchParams}
                        />
                        <ToggleViewButton
                            label={toggleButtonLabel}
                            isShowingAll={isShowingAllInvitations}
                            searchParams={resolvedSearchParams}
                        />
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
                                        organizationId={organization.id}
                                        organizationName={organization.name}
                                    />
                                </EmptyContent>
                            )}
                        </Empty>
                    ) : (
                        <>
                            <p className="text-muted-foreground text-sm">{filterStatusMessage}</p>
                            <ItemGroup>
                                {invitations.map((invitation, index) => (
                                    <React.Fragment key={invitation.id}>
                                        <InvitationItem
                                            invitation={invitation}
                                            organizationId={organization.id}
                                            canCreate={canInvitationCreate}
                                            canCancel={canInvitationCancel}
                                            locale={locale}
                                        />
                                        {index !== invitations.length - 1 && <ItemSeparator />}
                                    </React.Fragment>
                                ))}
                            </ItemGroup>
                            <Pagination
                                totalPages={totalPages}
                                page={page}
                                searchParams={resolvedSearchParams}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
