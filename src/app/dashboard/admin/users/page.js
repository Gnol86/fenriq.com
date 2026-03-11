import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";
import UserTableRow from "./components/user-table-row";

const USERS_PER_PAGE = 10;
const ALLOWED_SORT_FIELDS = new Set(["createdAt", "name", "email"]);
const ALLOWED_SORT_DIRECTIONS = new Set(["asc", "desc"]);

export default async function AdminUsersPage({ searchParams }) {
    const tUsers = await getTranslations("admin.users");

    // Vérifie que l'utilisateur est admin
    const { user } = await requireAdmin();

    // Parse search parameters
    const resolvedSearchParams = await searchParams;
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "");
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const rawSortBy = getLastSearchParamValue(resolvedSearchParams?.sortBy, "createdAt");
    const rawSortDirection = getLastSearchParamValue(resolvedSearchParams?.sortDirection, "desc");
    const sortBy = ALLOWED_SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
    const sortDirection = ALLOWED_SORT_DIRECTIONS.has(rawSortDirection) ? rawSortDirection : "desc";

    const whereClause = searchValue
        ? {
              OR: [
                  {
                      name: {
                          contains: searchValue,
                          mode: "insensitive",
                      },
                  },
                  {
                      email: {
                          contains: searchValue,
                          mode: "insensitive",
                      },
                  },
              ],
          }
        : {};

    const totalUsers = await prisma.user.count({
        where: whereClause,
    });
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/admin/users",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * USERS_PER_PAGE;

    const users = (
        await prisma.user.findMany({
            where: whereClause,
            orderBy: {
                [sortBy]: sortDirection,
            },
            skip: offset,
            take: USERS_PER_PAGE,
        })
    ).map(userItem => ({
        ...userItem,
        banned: Boolean(userItem.banned),
        role: userItem.role ?? "user",
    }));

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{tUsers("page_title")}</CardTitle>
                    <CardDescription>
                        {tUsers("page_description", { count: totalUsers })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex w-full flex-col gap-4">
                    {/* Search */}
                    <SearchInput
                        placeholder={tUsers("search_placeholder")}
                        initialValue={searchValue}
                        searchParams={resolvedSearchParams}
                    />

                    {/* Users table */}
                    <Table>
                        {!users.length && (
                            <TableCaption>
                                {searchValue ? tUsers("no_search_results") : tUsers("no_users")}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>{tUsers("table_user")}</TableHead>
                                <TableHead>{tUsers("table_role")}</TableHead>
                                <TableHead>{tUsers("table_status")}</TableHead>
                                <TableHead>{tUsers("table_created")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(userItem => (
                                <UserTableRow
                                    key={userItem.id}
                                    user={userItem}
                                    currentUserId={user.id}
                                />
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination
                        totalPages={totalPages}
                        page={safePage}
                        searchParams={resolvedSearchParams}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
