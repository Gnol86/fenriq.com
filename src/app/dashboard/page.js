import {
    getCurrentOrganization,
    getListOrganizations,
    requireUser,
} from "@/lib/auth-access";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
    const [user, organizationsRaw = [], activeOrganization] = await Promise.all(
        [requireUser(), getListOrganizations(), getCurrentOrganization()]
    );

    const organizations = Array.isArray(organizationsRaw)
        ? organizationsRaw
        : [];
    const sortedOrganizations = [...organizations].sort((a, b) =>
        (a?.name ?? "").localeCompare(b?.name ?? "", "fr", {
            sensitivity: "accent",
        })
    );
    const activeOrganizationId = activeOrganization?.id ?? null;
    const hasOrganizations = sortedOrganizations.length > 0;

    return (
        <div className="flex flex-col gap-6 p-10 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Bienvenue {user?.name ?? "sur votre espace"}.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organisation active</CardTitle>
                    <CardDescription>
                        Aperçu de l&apos;organisation actuellement sélectionnée.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {activeOrganization ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-muted text-base">
                                        {getInitials(
                                            activeOrganization?.name ?? ""
                                        )}
                                    </AvatarFallback>
                                    <AvatarImage
                                        src={
                                            activeOrganization?.image ??
                                            undefined
                                        }
                                        alt={`Avatar de ${activeOrganization?.name ?? "organisation"}`}
                                    />
                                </Avatar>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold text-foreground truncate">
                                            {activeOrganization?.name ??
                                                "Organisation"}
                                        </span>
                                        <Badge variant="secondary">
                                            Active
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground break-all">
                                        ID&nbsp;:{" "}
                                        {activeOrganization?.id ?? "inconnu"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <p>
                                    Gérez les membres, les autorisations et les
                                    paramètres depuis l&apos;onglet
                                    Organisations.
                                </p>
                                <Link
                                    href="/dashboard/orgs/manage"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Gérer cette organisation
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <p>
                                Aucune organisation active n&apos;est
                                sélectionnée.
                            </p>
                            <p>
                                Sélectionnez une organisation dans le menu
                                latéral ou
                                <Link
                                    href="/dashboard/orgs/new"
                                    className="ml-1 text-primary hover:underline"
                                >
                                    créez-en une nouvelle
                                </Link>
                                .
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Mes organisations</CardTitle>
                    <CardDescription>
                        Liste des organisations auxquelles vous avez accès.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {hasOrganizations ? (
                        sortedOrganizations.map((organization, index) => {
                            const isActive =
                                organization?.id === activeOrganizationId;

                            return (
                                <div
                                    key={
                                        organization?.id ??
                                        `organization-${index}`
                                    }
                                    className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-muted text-sm">
                                                {getInitials(
                                                    organization?.name ?? ""
                                                )}
                                            </AvatarFallback>
                                            <AvatarImage
                                                src={
                                                    organization?.image ??
                                                    undefined
                                                }
                                                alt={`Avatar de ${organization?.name ?? "organisation"}`}
                                            />
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {organization?.name ??
                                                    "Organisation"}
                                            </span>
                                            <span className="text-xs text-muted-foreground break-all">
                                                ID&nbsp;:{" "}
                                                {organization?.id ?? "inconnu"}
                                            </span>
                                        </div>
                                    </div>
                                    {isActive ? (
                                        <Badge variant="secondary">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            Disponible
                                        </Badge>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                            Aucune organisation pour le moment. Créez votre
                            première organisation pour commencer.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
