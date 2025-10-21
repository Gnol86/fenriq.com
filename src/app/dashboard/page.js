import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import ImageProfile from "@/components/image-profile";
import LeaveOrganizationButton from "@/components/leave-organization-button";
import OrganizationSelectorButton from "@/components/organization-selector-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { ButtonGroup } from "@root/src/components/ui/button-group";
import { requireActiveOrganization } from "@root/src/lib/access-control";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
    const t = await getTranslations("dashboard.index");

    // Vérifie que l'utilisateur est authentifié
    const { session, user, organization } = await requireActiveOrganization();

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });
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
                        {t("active_organization_description")}
                    </CardDescription>
                    <CardAction>
                        {organization ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <ImageProfile
                                        entity={organization}
                                        size="lg"
                                    />
                                    <span className="truncate font-semibold">
                                        {organization?.name ??
                                            t("organization_fallback")}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted-foreground flex flex-col gap-3 text-sm">
                                <p>{t("no_active_organization")}</p>
                            </div>
                        )}
                    </CardAction>
                </CardHeader>
                {contacts?.length && (
                    <CardContent className="flex flex-col gap-4">
                        {t("contact_persons_title")}
                        {contacts?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {contacts.map(contact => {
                                    return (
                                        <div
                                            key={contact.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <ImageProfile
                                                    entity={contact?.user}
                                                    size="md"
                                                />
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <span className="text-foreground truncate text-sm font-medium">
                                                        {contact?.user.name ??
                                                            t(
                                                                "contact_fallback"
                                                            )}
                                                    </span>
                                                    <span className="text-foreground -mt-1 truncate text-sm font-bold">
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
                                                            t("no_email")
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                                {t("no_contacts")}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t("my_organizations_title")}</CardTitle>
                    <CardDescription>
                        {t("my_organizations_description")}
                    </CardDescription>
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
                                            {org?.name ??
                                                t("organization_fallback")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ButtonGroup>
                                            <OrganizationSelectorButton
                                                organization={org}
                                                isActive={
                                                    org?.id === organization?.id
                                                }
                                                activeOrganizationId={
                                                    organization?.id
                                                }
                                            />
                                            <LeaveOrganizationButton
                                                organization={org}
                                                isActive={
                                                    org?.id === organization?.id
                                                }
                                            />
                                        </ButtonGroup>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                            {t("no_organizations")}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
