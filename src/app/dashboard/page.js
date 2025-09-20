import {
    getCurrentOrganization,
    getListOrganizations,
    requireUser,
    getListContactsActiveOrganization,
} from "@/lib/auth-access";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";

export default async function DashboardPage() {
    const [user, organizationsRaw = [], activeOrganization, contacts] =
        await Promise.all([
            requireUser(),
            getListOrganizations(),
            getCurrentOrganization(),
            getListContactsActiveOrganization(),
        ]);

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
            <Breadcrumb items={[{ name: "Dashboard", href: "/dashboard" }]} />
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">
                    Bienvenue {user?.name ?? "sur votre espace"}.
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organisation active</CardTitle>
                    <CardDescription>
                        Aperçu de l&apos;organisation actuelle.
                    </CardDescription>
                    <CardAction>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                <p>
                                    Aucune organisation active n&apos;est
                                    sélectionnée.
                                </p>
                            </div>
                        )}
                    </CardAction>
                </CardHeader>
                {activeOrganization && (
                    <CardContent className="flex flex-col gap-4">
                        Personnes de contact
                        {contacts?.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {contacts.map(contact => {
                                    return (
                                        <div
                                            key={contact.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-muted text-sm">
                                                        {getInitials(
                                                            contact?.user
                                                                .name ?? ""
                                                        )}
                                                    </AvatarFallback>
                                                    <AvatarImage
                                                        src={
                                                            contact?.image ??
                                                            undefined
                                                        }
                                                        alt={`Avatar de ${contact?.user.name ?? "contact"}`}
                                                    />
                                                </Avatar>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-sm font-medium text-foreground truncate">
                                                        {contact?.user.name ??
                                                            "Contact"}
                                                    </span>
                                                    <span className="text-sm font-bold -mt-1 text-foreground truncate">
                                                        {contact?.user.email ? (
                                                            <Link
                                                                href={`mailto:${contact?.user.email}`}
                                                            >
                                                                {
                                                                    contact
                                                                        ?.user
                                                                        .email
                                                                }
                                                            </Link>
                                                        ) : (
                                                            "Pas d'adresse mail renseignée"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                                Aucun contact pour le moment.
                            </div>
                        )}
                    </CardContent>
                )}
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
                                            <span className="text-sm font-bold text-foreground truncate">
                                                {organization?.name ??
                                                    "Organisation"}
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
