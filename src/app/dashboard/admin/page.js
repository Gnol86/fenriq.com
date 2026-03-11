import { Building, LayoutDashboard, MessageSquare, ReceiptEuro, Users } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/access-control";
import prisma from "@/lib/prisma";

async function getAdminDashboardData() {
    const [
        totalUsers,
        totalAdmins,
        totalBannedUsers,
        totalOrganizations,
        totalSubscriptions,
        totalActiveSubscriptions,
        totalCancelingSubscriptions,
        totalFeedbacks,
        totalUnreadFeedbacks,
        totalUnresolvedFeedbacks,
        feedbackAggregate,
        totalPlans,
        totalVisiblePlans,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                role: "admin",
            },
        }),
        prisma.user.count({
            where: {
                banned: true,
            },
        }),
        prisma.organization.count(),
        prisma.subscription.count(),
        prisma.subscription.count({
            where: {
                status: {
                    in: ["active", "trialing"],
                },
            },
        }),
        prisma.subscription.count({
            where: {
                cancelAtPeriodEnd: true,
            },
        }),
        prisma.feedback.count(),
        prisma.feedback.count({
            where: {
                isRead: false,
            },
        }),
        prisma.feedback.count({
            where: {
                isResolved: false,
            },
        }),
        prisma.feedback.aggregate({
            _avg: {
                rating: true,
            },
        }),
        prisma.plan.count(),
        prisma.plan.count({
            where: {
                showInPricingPage: true,
            },
        }),
    ]);

    return {
        users: {
            total: totalUsers,
            admins: totalAdmins,
            banned: totalBannedUsers,
        },
        organizations: {
            total: totalOrganizations,
        },
        subscriptions: {
            total: totalSubscriptions,
            active: totalActiveSubscriptions,
            cancelAtPeriodEnd: totalCancelingSubscriptions,
        },
        feedbacks: {
            total: totalFeedbacks,
            unread: totalUnreadFeedbacks,
            unresolved: totalUnresolvedFeedbacks,
            averageRating:
                feedbackAggregate._avg.rating === null
                    ? "0.0"
                    : feedbackAggregate._avg.rating.toFixed(1),
        },
        plans: {
            total: totalPlans,
            visible: totalVisiblePlans,
        },
    };
}

export default async function AdminPage() {
    await requireAdmin();
    const t = await getTranslations("admin.dashboard");
    const dashboardData = await getAdminDashboardData();

    const metricCards = [
        {
            key: "users",
            href: "/dashboard/admin/users",
            title: t("users_title"),
            description: t("users_description"),
            value: dashboardData.users.total,
            Icon: Users,
            stats: [
                t("users_admins", { count: dashboardData.users.admins }),
                t("users_banned", { count: dashboardData.users.banned }),
            ],
        },
        {
            key: "organizations",
            href: "/dashboard/admin/orgs",
            title: t("organizations_title"),
            description: t("organizations_description"),
            value: dashboardData.organizations.total,
            Icon: Building,
            stats: [t("organizations_total", { count: dashboardData.organizations.total })],
        },
        {
            key: "subscriptions",
            href: "/dashboard/admin/orgs",
            title: t("subscriptions_title"),
            description: t("subscriptions_description"),
            value: dashboardData.subscriptions.total,
            Icon: ReceiptEuro,
            stats: [
                t("subscriptions_active", { count: dashboardData.subscriptions.active }),
                t("subscriptions_cancel_at_period_end", {
                    count: dashboardData.subscriptions.cancelAtPeriodEnd,
                }),
            ],
        },
        {
            key: "feedbacks",
            href: "/dashboard/admin/feedbacks",
            title: t("feedbacks_title"),
            description: t("feedbacks_description"),
            value: dashboardData.feedbacks.total,
            Icon: MessageSquare,
            stats: [
                t("feedbacks_unread", { count: dashboardData.feedbacks.unread }),
                t("feedbacks_unresolved", { count: dashboardData.feedbacks.unresolved }),
                t("feedbacks_average", { average: dashboardData.feedbacks.averageRating }),
            ],
        },
    ];

    const quickLinks = [
        {
            key: "users",
            href: "/dashboard/admin/users",
            title: t("users_title"),
            description: t("quick_users_description"),
            badges: [
                t("users_total", { count: dashboardData.users.total }),
                t("users_admins", { count: dashboardData.users.admins }),
            ],
        },
        {
            key: "organizations",
            href: "/dashboard/admin/orgs",
            title: t("organizations_title"),
            description: t("quick_organizations_description"),
            badges: [
                t("organizations_total", { count: dashboardData.organizations.total }),
                t("subscriptions_active", { count: dashboardData.subscriptions.active }),
            ],
        },
        {
            key: "plans",
            href: "/dashboard/admin/plans",
            title: t("plans_title"),
            description: t("quick_plans_description"),
            badges: [
                t("plans_total", { count: dashboardData.plans.total }),
                t("plans_visible", { count: dashboardData.plans.visible }),
            ],
        },
        {
            key: "feedbacks",
            href: "/dashboard/admin/feedbacks",
            title: t("feedbacks_title"),
            description: t("quick_feedbacks_description"),
            badges: [
                t("feedbacks_unread", { count: dashboardData.feedbacks.unread }),
                t("feedbacks_unresolved", { count: dashboardData.feedbacks.unresolved }),
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="text-muted-foreground size-5" />
                    <h1 className="text-3xl font-bold">{t("page_title")}</h1>
                </div>
                <p className="text-muted-foreground">{t("page_description")}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {metricCards.map(({ key, href, title, description, value, Icon, stats }) => (
                    <Link
                        key={key}
                        href={href}
                        className="focus-visible:ring-ring focus-visible:ring-offset-background block rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                                <CardAction className="text-muted-foreground">
                                    <Icon className="size-5" />
                                </CardAction>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-1">
                                <p className="text-3xl font-semibold">{value}</p>
                                {stats.map(stat => (
                                    <p key={stat} className="text-muted-foreground text-sm">
                                        {stat}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold">{t("quick_actions_title")}</h2>
                    <p className="text-muted-foreground text-sm">
                        {t("quick_actions_description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {quickLinks.map(link => (
                        <Card key={link.key} size="sm">
                            <CardHeader>
                                <CardTitle>{link.title}</CardTitle>
                                <CardDescription>{link.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {link.badges.map(badge => (
                                        <Badge key={badge} variant="outline">
                                            {badge}
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    nativeButton={false}
                                    render={<Link href={link.href} />}
                                >
                                    {t("open_section")}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
