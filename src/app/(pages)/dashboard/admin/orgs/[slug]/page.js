import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Settings,
    Users,
    Mail,
    AlertTriangle,
    Calendar,
    Building2,
} from "lucide-react";
import ImageProfile from "@/components/image-profile";
import { getOrganizationBySlugAsAdminAction } from "@/actions/admin.action";

export default async function AdminOrganizationPage({ params }) {
    const { slug } = params;

    const organization = await getOrganizationBySlugAsAdminAction({ slug });

    console.log(organization);

    if (!organization || organization.error) {
        notFound();
    }

    const members = organization.members || [];
    const memberCount = members.length;
    const adminCount = members.filter(
        member => member.role.includes("admin") || member.role.includes("owner")
    ).length;

    return (
        <div className="flex flex-col gap-6">
            {/* En-tête organisation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <ImageProfile user={organization} size="2xl" />
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl">
                                {organization.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Slug: {organization.slug}
                            </CardDescription>
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Créé le{" "}
                                {new Date(
                                    organization.createdAt
                                ).toLocaleDateString("fr-FR")}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Membres
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memberCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {adminCount} admin{adminCount > 1 ? "s" : ""}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Statut
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            Actif
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Organisation fonctionnelle
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Standard</div>
                        <p className="text-xs text-muted-foreground">
                            Plan par défaut
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation vers les sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Gérer l&apos;organisation
                        </CardTitle>
                        <CardDescription>
                            Modifiez les informations de base de
                            l&apos;organisation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/dashboard/admin/orgs/${slug}/manage`}>
                                Accéder aux paramètres
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Membres ({memberCount})
                        </CardTitle>
                        <CardDescription>
                            Gérez les membres et leurs rôles dans
                            l&apos;organisation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link
                                href={`/dashboard/admin/orgs/${slug}/members`}
                            >
                                Gérer les membres
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Invitations
                        </CardTitle>
                        <CardDescription>
                            Gérez les invitations en cours et invitez de
                            nouveaux membres.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link
                                href={`/dashboard/admin/orgs/${slug}/invitations`}
                            >
                                Gérer les invitations
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Zone de danger
                        </CardTitle>
                        <CardDescription>
                            Actions irréversibles sur l&apos;organisation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            asChild
                            variant="destructive"
                            className="w-full"
                        >
                            <Link
                                href={`/dashboard/admin/orgs/${slug}/danger-zone`}
                            >
                                Accéder à la zone de danger
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Informations supplémentaires */}
            {organization.metadata && (
                <Card>
                    <CardHeader>
                        <CardTitle>Métadonnées</CardTitle>
                        <CardDescription>
                            Informations techniques supplémentaires.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-sm bg-muted p-4 rounded">
                            {JSON.stringify(organization.metadata, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
