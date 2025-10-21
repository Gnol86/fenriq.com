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
import { requireAuth } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@root/prisma/generated";
import { ButtonGroup } from "@root/src/components/ui/button-group";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
    const t = await getTranslations("dashboard.index");

    // Vérifie que l'utilisateur est authentifié
    const { session, user } = await requireAuth();

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = session.activeOrganizationId
        ? userOrganizations?.find(
              org => org.id === session.activeOrganizationId
          )
        : null;

    const prisma = new PrismaClient();
    const contacts = activeUserOrganization
        ? await prisma.member.findMany({
              where: {
                  organizationId: activeUserOrganization.id,
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
                        {activeUserOrganization ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <ImageProfile
                                        entity={activeUserOrganization}
                                        size="lg"
                                    />
                                    <span className="truncate font-semibold">
                                        {activeUserOrganization?.name ??
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
                {activeUserOrganization && (
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
                        userOrganizations.map((organization, index) => {
                            return (
                                <div
                                    key={
                                        organization?.id ??
                                        `organization-${index}`
                                    }
                                    className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <ImageProfile
                                            entity={organization}
                                            size="md"
                                        />
                                        <span className="truncate font-bold">
                                            {organization?.name ??
                                                t("organization_fallback")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ButtonGroup>
                                            <OrganizationSelectorButton
                                                organization={organization}
                                                isActive={
                                                    organization?.id ===
                                                    activeUserOrganization?.id
                                                }
                                                activeOrganizationId={
                                                    activeUserOrganization?.id
                                                }
                                            />
                                            <LeaveOrganizationButton
                                                organization={organization}
                                                isActive={
                                                    organization?.id ===
                                                    activeUserOrganization?.id
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
