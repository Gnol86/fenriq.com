import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import SearchInput from "@/components/ui/search-input";
import OrganizationTableRow from "./components/organization-table-row";

const ORGS_PER_PAGE = 10;

export default async function AdminOrganizationsPage({ searchParams }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (user.role !== "admin") {
        redirect("/dashboard");
    }

    // Parse search parameters
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const sortBy = resolvedSearchParams?.sortBy || "createdAt";
    const sortDirection = resolvedSearchParams?.sortDirection || "desc";

    // Calculate pagination
    const offset = (page - 1) * ORGS_PER_PAGE;

    // Fetch organizations avec leurs membres
    const basicOrganizations =
        (await auth.api.listOrganizations({
            headers: await headers(),
        })) || [];

    // Récupérer les détails complets de chaque organisation (avec membres)
    const allOrganizations = await Promise.all(
        basicOrganizations.map(async org => {
            try {
                const fullOrg = await auth.api.getFullOrganization({
                    body: {
                        organizationId: org.id,
                        membersLimit: 50, // Limite de 50 membres par org
                    },
                    headers: await headers(),
                });
                return fullOrg || org;
            } catch (error) {
                console.error(
                    `Erreur lors de la récupération de l'org ${org.id}:`,
                    error
                );
                return org; // Retourner l'org de base en cas d'erreur
            }
        })
    );

    // Filtrer et paginer côté client (pour l'instant)
    let filteredOrgs = allOrganizations;

    // Appliquer la recherche si une valeur est fournie
    if (searchValue) {
        filteredOrgs = allOrganizations.filter(
            org =>
                org.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                org.slug?.toLowerCase().includes(searchValue.toLowerCase())
        );
    }

    // Calculer la pagination
    const totalOrgs = filteredOrgs.length;
    const organizations = filteredOrgs.slice(offset, offset + ORGS_PER_PAGE);
    const totalPages = Math.ceil(totalOrgs / ORGS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion des organisations</CardTitle>
                    <CardDescription>
                        Gérez toutes les organisations de la plateforme. Total:{" "}
                        {totalOrgs} organisations
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col w-full gap-4">
                    {/* Search */}
                    <SearchInput placeholder="Rechercher par nom d'organisation..." />

                    {/* Organizations table */}
                    <Table>
                        {!organizations.length && (
                            <TableCaption>
                                {searchValue
                                    ? "Aucune organisation trouvée pour cette recherche."
                                    : "Aucune organisation trouvée."}
                            </TableCaption>
                        )}
                        <TableHeader>
                            <TableRow>
                                <TableHead>Organisation</TableHead>
                                <TableHead>Membres</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Créée le</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {organizations.map(org => (
                                <OrganizationTableRow
                                    key={org.id}
                                    organization={org}
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
                                    {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
                                            const pageNum = Math.max(
                                                1,
                                                Math.min(
                                                    page - 2 + i,
                                                    totalPages - 4 + i
                                                )
                                            );
                                            if (pageNum > totalPages)
                                                return null;

                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        href={`?${new URLSearchParams(
                                                            {
                                                                ...resolvedSearchParams,
                                                                page: pageNum.toString(),
                                                            }
                                                        ).toString()}`}
                                                        isActive={
                                                            pageNum === page
                                                        }
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                    )}

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
