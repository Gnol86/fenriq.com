import { requireAdmin } from "@root/src/lib/access-control";
import prisma from "@root/src/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import React from "react";
import ImageProfile from "@/components/image-profile";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
            <dt className="text-muted-foreground min-w-[200px] text-sm font-medium">{label}</dt>
            <dd className="text-sm">{value}</dd>
        </div>
    );
}

export default async function AdminOrganizationPage({ params }) {
    // Vérifie que l'utilisateur est admin
    await requireAdmin();

    const { slug } = await params;

    const t = await getTranslations("admin.organizations");
    const tCommon = await getTranslations("common");
    const tRoles = await getTranslations("roles");
    const locale = await getLocale();

    const organisation = await prisma.organization.findUnique({
        where: { slug: slug },
        include: {
            members: {
                where: { role: "owner" },
                include: {
                    user: true,
                },
            },
        },
    });

    if (!organisation) {
        notFound();
    }

    const subscription = await prisma.subscription.findUnique({
        where: { referenceId: organisation.id },
    });

    const nbMembers = await prisma.member.count({
        where: { organizationId: organisation.id },
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("detail_page_title")}</CardTitle>
                    <CardDescription>{organisation.name}</CardDescription>
                    <CardAction>
                        <ImageProfile entity={organisation} />
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {organisation.members.length > 0 ? (
                        <ItemGroup>
                            {organisation.members.map((member, index) => (
                                <React.Fragment key={member.id}>
                                    {index > 0 && <ItemSeparator />}
                                    <Item>
                                        <ItemMedia>
                                            <ImageProfile entity={member.user} />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>{member.user.name}</ItemTitle>
                                            <ItemDescription>{member.user.email}</ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <span className="text-muted-foreground text-sm">
                                                {tRoles(member.role)}
                                            </span>
                                        </ItemActions>
                                    </Item>
                                </React.Fragment>
                            ))}
                        </ItemGroup>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            {t("detail_contact_no_contact")}
                        </p>
                    )}
                </CardContent>
            </Card>
            {/* Abonnement */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("detail_subscription_title")}</CardTitle>
                    <CardDescription>{t("detail_subscription_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {subscription ? (
                        <dl className="divide-y">
                            <DetailRow
                                label={t("detail_subscription_id")}
                                value={subscription.id}
                            />
                            <DetailRow
                                label={t("detail_subscription_plan")}
                                value={subscription.plan}
                            />
                            <DetailRow
                                label={t("detail_subscription_status")}
                                value={subscription.status ?? tCommon("n_a")}
                            />
                            {/* <DetailRow
                                label={t("detail_subscription_customer_id")}
                                value={
                                    subscription.stripeCustomerId ??
                                    tCommon("n_a")
                                }
                            />*/}
                            <DetailRow
                                label={t("detail_subscription_subscription_id")}
                                value={subscription.stripeSubscriptionId ?? tCommon("n_a")}
                            />
                            <DetailRow
                                label={t("detail_subscription_seats")}
                                value={subscription.seats ?? tCommon("n_a")}
                            />
                            <DetailRow
                                label={t("detail_subscription_amount")}
                                value={
                                    subscription.amount
                                        ? `${subscription.amount / 100} ${subscription.currency?.toUpperCase()}`
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_interval")}
                                value={subscription.interval ?? tCommon("n_a")}
                            />
                            <DetailRow
                                label={t("detail_subscription_current_period_start")}
                                value={
                                    subscription.currentPeriodStart
                                        ? formatDate(subscription.currentPeriodStart, locale)
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_current_period_end")}
                                value={
                                    subscription.currentPeriodEnd
                                        ? formatDate(subscription.currentPeriodEnd, locale)
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_cancel_at_period_end")}
                                value={
                                    subscription.cancelAtPeriodEnd
                                        ? t("detail_yes")
                                        : t("detail_no")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_canceled_at")}
                                value={
                                    subscription.canceledAt
                                        ? formatDate(subscription.canceledAt, locale)
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_trial_start")}
                                value={
                                    subscription.trialStart
                                        ? formatDate(subscription.trialStart, locale)
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_trial_end")}
                                value={
                                    subscription.trialEnd
                                        ? formatDate(subscription.trialEnd, locale)
                                        : tCommon("n_a")
                                }
                            />
                            <DetailRow
                                label={t("detail_subscription_created_at")}
                                value={formatDate(subscription.createdAt, locale)}
                            />
                            <DetailRow
                                label={t("detail_subscription_updated_at")}
                                value={formatDate(subscription.updatedAt, locale)}
                            />
                        </dl>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            {t("detail_subscription_no_subscription")}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Informations générales */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("detail_info_title")}</CardTitle>
                    <CardDescription>{t("detail_info_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="divide-y">
                        <DetailRow label={t("detail_id")} value={organisation.id} />
                        <DetailRow label={t("detail_name")} value={organisation.name} />
                        <DetailRow
                            label={t("detail_slug")}
                            value={organisation.slug ?? tCommon("n_a")}
                        />
                        <DetailRow label={t("detail_members_count")} value={nbMembers} />
                        <DetailRow
                            label={t("detail_created_at")}
                            value={formatDate(organisation.createdAt, locale)}
                        />
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
