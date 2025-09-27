import ImageProfile from "@/components/image-profile";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import SearchInput from "@/components/ui/search-input";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const ORGS_PER_PAGE = 10;

export default async function AdminOrganizationsPage({ searchParams }) {
    // Parse search parameters
    const resolvedSearchParams = await searchParams;
    const searchValue = resolvedSearchParams?.search || "";
    const limit = ORGS_PER_PAGE;
    const page = parseInt(resolvedSearchParams?.page || "1", 10);
    const offset = (page - 1) * ORGS_PER_PAGE;
    const sortBy = resolvedSearchParams?.sortBy || "name";
    const sortDirection = resolvedSearchParams?.sortDirection || "asc";

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch organizations avec leurs membres - optimisation pour éviter les doublons

    const prisma = new PrismaClient();
    const lengthTotalOrgs = await prisma.organization.count();

    const organizations = await prisma.organization.findMany({
        where: {
            name: {
                contains: searchValue,
            },
        },
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
                    <CardTitle>Gestion des organisations</CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                        Gérez toutes les organisations de la plateforme.
                        <span className="text-muted-foreground">
                            Total: {lengthTotalOrgs} organisations
                        </span>
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
                                <TableHead>Statut</TableHead>
                                <TableHead>Membres</TableHead>
                                <TableHead>Créée le</TableHead>
                                <TableHead className="text-right">
                                    Détails
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
                                                user={org}
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
                                            A modifier
                                        </Badge>
                                    </TableCell>

                                    {/* Membres */}
                                    <TableCell>{org._count.members}</TableCell>

                                    {/* Date de création */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(org.createdAt)}
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
