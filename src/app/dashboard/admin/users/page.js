import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import SearchInput from "@/components/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import UserTableRow from "./components/user-table-row";

const USERS_PER_PAGE = 10;

export default async function AdminUsersPage({ searchParams }) {
    const tUsers = await getTranslations("admin.users");

    // Vérifie que l'utilisateur est admin
    const { user } = await requireAdmin();

    // Parse search parameters
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const sortBy = resolvedSearchParams?.sortBy || "createdAt";
    const sortDirection = resolvedSearchParams?.sortDirection || "desc";

    // Calculate pagination
    const offset = (page - 1) * USERS_PER_PAGE;

    // Fetch users with pagination and search
    const usersResponse = await auth.api.listUsers({
        query: {
            query: {
                searchValue,
                searchField: "name",
                searchOperator: "contains",
                limit: USERS_PER_PAGE,
                offset,
                sortBy,
                sortDirection,
            },
        },
        headers: await headers(),
    });

    const users = usersResponse?.users || [];
    const totalUsers = usersResponse?.total || 0;
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

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
                    <SearchInput placeholder={tUsers("search_placeholder")} />

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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={`?${new URLSearchParams({
                                                    ...resolvedSearchParams,
                                                    page: (page - 1).toString(),
                                                }).toString()}`}
                                            />
                                        </PaginationItem>
                                    )}

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(
                                            1,
                                            Math.min(page - 2 + i, totalPages - 4 + i)
                                        );
                                        if (pageNum > totalPages) return null;

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    href={`?${new URLSearchParams({
                                                        ...resolvedSearchParams,
                                                        page: pageNum.toString(),
                                                    }).toString()}`}
                                                    isActive={pageNum === page}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationNext
                                                href={`?${new URLSearchParams({
                                                    ...resolvedSearchParams,
                                                    page: (page + 1).toString(),
                                                }).toString()}`}
                                            />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
