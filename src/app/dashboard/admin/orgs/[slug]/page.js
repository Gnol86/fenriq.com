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
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { formatDate } from "@/lib/utils";

export default async function AdminOrganizationPage({ params }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session.user;
    if (user.role !== "admin") {
        notFound();
    }

    const t = await getTranslations("admin.organizations");
    const locale = await getLocale();
    const { slug } = params;

    const organization = await getOrganizationBySlugAsAdminAction({ slug });

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
                        <ImageProfile entity={organization} size="2xl" />
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl">
                                {organization.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {t("slug_label")} {organization.slug}
                            </CardDescription>
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t("created_on")}{" "}
                                {formatDate(organization.createdAt, locale)}
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
                            {t("stats_members")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memberCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("stats_admins", {
                                count: adminCount,
                                s: adminCount > 1 ? "s" : "",
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("stats_status")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {t("stats_status_active")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("stats_status_description")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("stats_type")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {t("stats_type_standard")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("stats_type_description")}
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
                            {t("manage_title")}
                        </CardTitle>
                        <CardDescription>
                            {t("manage_description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/dashboard/admin/orgs/${slug}/manage`}>
                                {t("manage_button")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {t("members_title", { count: memberCount })}
                        </CardTitle>
                        <CardDescription>
                            {t("members_description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link
                                href={`/dashboard/admin/orgs/${slug}/members`}
                            >
                                {t("members_button")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            {t("invitations_title")}
                        </CardTitle>
                        <CardDescription>
                            {t("invitations_description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link
                                href={`/dashboard/admin/orgs/${slug}/invitations`}
                            >
                                {t("invitations_button")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {t("danger_zone_title")}
                        </CardTitle>
                        <CardDescription>
                            {t("danger_zone_description")}
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
                                {t("danger_zone_button")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Informations supplémentaires */}
            {organization.metadata && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("metadata_title")}</CardTitle>
                        <CardDescription>
                            {t("metadata_description")}
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
