import { ButtonGroup } from "@root/src/components/ui/button-group";
import { getActiveOrganization, requireAuth } from "@root/src/lib/access-control";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ImageProfile from "@/components/image-profile";
import LeaveOrganizationButton from "@/components/leave-organization-button";
import OrganizationSelectorButton from "@/components/organization-selector-button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
    const t = await getTranslations("dashboard.index");

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const { organization } = await getActiveOrganization();

    const contacts = organization
        ? await prisma.member.findMany({
              where: {
                  organizationId: organization.id,
                  role: {
                      in: ["admin", "owner"],
                  },
              },
              include: {
                  user: {
                      select: {
                          name: true,
                          email: true,
                          image: true,
                      },
                  },
              },
          })
        : [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">
                    {t("welcome", { name: user?.name ?? t("fallback_space") })}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t("active_organization_title")}</CardTitle>
                    <CardDescription>
                        {organization
                            ? t("active_organization_description")
                            : t("no_active_organization")}
                    </CardDescription>
                    <CardAction>
                        {organization && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <ImageProfile entity={organization} size="lg" />
                                    <span className="truncate font-semibold">
                                        {organization?.name ?? t("organization_fallback")}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardAction>
                </CardHeader>
                {contacts?.length > 0 && (
                    <CardContent className="flex flex-col gap-4">
                        {t("contact_persons_title")}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {contacts.map(contact => {
                                return (
                                    <div
                                        key={contact.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <ImageProfile entity={contact?.user} size="md" />
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <span className="text-foreground truncate text-sm font-medium">
                                                    {contact?.user.name ?? t("contact_fallback")}
                                                </span>
                                                <span className="text-foreground -mt-1 truncate text-sm font-bold">
                                                    {contact?.user.email ? (
                                                        <Link
                                                            href={`mailto:${contact?.user.email}`}
                                                        >
                                                            {contact?.user.email}
                                                        </Link>
                                                    ) : (
                                                        t("no_email")
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                )}
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t("my_organizations_title")}</CardTitle>
                    <CardDescription>{t("my_organizations_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {userOrganizations.length > 0 ? (
                        userOrganizations.map((org, index) => {
                            return (
                                <div
                                    key={org?.id ?? `organization-${index}`}
                                    className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <ImageProfile entity={org} size="md" />
                                        <span className="truncate font-bold">
                                            {org?.name ?? t("organization_fallback")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ButtonGroup>
                                            <OrganizationSelectorButton
                                                organization={org}
                                                isActive={org?.id === organization?.id}
                                                activeOrganizationId={organization?.id}
                                            />
                                            <LeaveOrganizationButton organization={org} />
                                        </ButtonGroup>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                            {t("no_organizations")}
                            <div className="absolute top-0 left-0 pointer-events-none">
                                <Image
                                    src="/images/arrow.svg"
                                    alt="Arrow pointing down"
                                    width={200}
                                    height={200}
                                    className="mx-auto mt-6 animate-pulse rotate-200"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
