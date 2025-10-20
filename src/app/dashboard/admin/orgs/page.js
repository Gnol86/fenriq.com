import ImageProfile from "@/components/image-profile";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PrismaClient } from "@root/prisma/generated";
import { Eye } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();
const ORGS_PER_PAGE = 10;

export default async function AdminOrganizationsPage({ searchParams }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (user.role !== "admin") {
        notFound();
    }

    const t = await getTranslations("admin.organizations");
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

    const organizations = await prisma.organization.findMany({
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

                <CardContent className="flex flex-col w-full gap-4">
                    {/* Search */}
                    <SearchInput placeholder={t("search_placeholder")} />

                    {/* Organizations table */}
                    <Table>
                        {!organizations.length && (
                            <TableCaption>
                                {searchValue
                                    ? t("no_search_results")
                                    : t("no_organizations")}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_organization")}</TableHead>
                                <TableHead>{t("table_status")}</TableHead>
                                <TableHead>{t("table_members")}</TableHead>
                                <TableHead>{t("table_created")}</TableHead>
                                <TableHead className="text-right">
                                    {t("table_details")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {organizations.map(org => (
                                <TableRow key={org.id}>
                                    {/* Organisation avec logo et informations */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ImageProfile
                                                entity={org}
                                                size="sm"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">
                                                    {org.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {org.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Statut */}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {t("status_placeholder")}
                                        </Badge>
                                    </TableCell>

                                    {/* Membres */}
                                    <TableCell>{org._count.members}</TableCell>

                                    {/* Date de création */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(org.createdAt, locale)}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Link
                                            href={`/dashboard/admin/orgs/${org.slug}`}
                                        >
                                            <Button size="icon" variant="ghost">
                                                <Eye />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination totalPages={totalPages} page={page} />
                </CardContent>
            </Card>
        </div>
    );
}
