import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import ImageProfile from "@/components/image-profile";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const ORGS_PER_PAGE = 10;

export default async function AdminOrganizationsPage({ searchParams }) {
    // Vérifie que l'utilisateur est admin
    await requireAdmin();

    const t = await getTranslations("admin.organizations");
    const tSub = await getTranslations("organization.subscription");
    const tCommon = await getTranslations("common");
    const locale = await getLocale();
    // Parse search parameters
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const limit = ORGS_PER_PAGE;
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const offset = (page - 1) * ORGS_PER_PAGE;
    const sortBy = resolvedSearchParams?.sortBy || "name";
    const sortDirection = resolvedSearchParams?.sortDirection || "asc";

    // Fetch organizations avec leurs membres - optimisation pour éviter les doublons

    const whereClause = searchValue
        ? {
              name: {
                  contains: searchValue,
                  mode: "insensitive",
              },
          }
        : {};

    const lengthTotalOrgs = await prisma.organization.count({
        where: whereClause,
    });

    const orgs = await prisma.organization.findMany({
        where: whereClause,
        orderBy: {
            [sortBy]: sortDirection,
        },
        include: {
            _count: {
                select: {
                    members: true,
                },
            },
        },
        skip: offset,
        take: limit,
    });

    // Fetch subscriptions separately (no direct relation in schema)
    const orgIds = orgs.map(o => o.id);
    const subscriptions = orgIds.length
        ? await prisma.subscription.findMany({
              where: { referenceId: { in: orgIds } },
          })
        : [];
    const subByOrg = {};
    for (const sub of subscriptions) {
        if (!subByOrg[sub.referenceId]) subByOrg[sub.referenceId] = sub;
    }

    const organizations = orgs.map(org => ({
        ...org,
        subscriptions: subByOrg[org.id] ? [subByOrg[org.id]] : [],
    }));
    const totalPages = Math.ceil(lengthTotalOrgs / ORGS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                        {t("page_description")}
                        <span className="text-muted-foreground">
                            {t("page_total", { count: lengthTotalOrgs })}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex w-full flex-col gap-4">
                    {/* Search */}
                    <SearchInput placeholder={t("search_placeholder")} />

                    {/* Organizations table */}
                    <Table>
                        {!organizations.length && (
                            <TableCaption>
                                {searchValue ? t("no_search_results") : t("no_organizations")}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_organization")}</TableHead>
                                <TableHead>{t("table_status")}</TableHead>
                                <TableHead>{t("table_members")}</TableHead>
                                <TableHead>{t("table_created")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {organizations.map(org => {
                                const orgHref = `/dashboard/admin/orgs/${org.slug}`;

                                return (
                                    <TableRow key={org.id} className="focus-within:bg-muted/50">
                                        {/* Organisation avec logo et informations */}
                                        <TableCell>
                                            <Link
                                                href={orgHref}
                                                className="text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex w-full items-center gap-2 rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <ImageProfile entity={org} size="sm" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {org.name}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {org.slug}
                                                    </span>
                                                </div>
                                            </Link>
                                        </TableCell>

                                        {/* Statut */}
                                        <TableCell>
                                            <Link
                                                href={orgHref}
                                                className="focus-visible:ring-ring focus-visible:ring-offset-background flex w-full items-center rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                aria-label={t("table_status")}
                                            >
                                                <Badge variant="outline" className="text-xs">
                                                    {org.subscriptions?.[0]?.status
                                                        ? tSub(
                                                              `status_${org.subscriptions[0].status}`
                                                          )
                                                        : org._count.members > 0
                                                          ? t("stats_status_active")
                                                          : tCommon("n_a")}
                                                </Badge>
                                            </Link>
                                        </TableCell>

                                        {/* Membres */}
                                        <TableCell className="text-sm">
                                            <Link
                                                href={orgHref}
                                                className="focus-visible:ring-ring focus-visible:ring-offset-background block w-full rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                aria-label={t("table_members")}
                                            >
                                                {org._count.members}
                                            </Link>
                                        </TableCell>

                                        {/* Date de création */}
                                        <TableCell>
                                            <Link
                                                href={orgHref}
                                                className="text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background block w-full rounded-md px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                aria-label={t("table_created")}
                                            >
                                                {formatDate(org.createdAt, locale)}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Pagination totalPages={totalPages} page={page} />
                </CardContent>
            </Card>
        </div>
    );
}
