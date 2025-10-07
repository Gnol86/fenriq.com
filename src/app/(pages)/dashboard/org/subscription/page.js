import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermissionAction } from "@/actions/organization.action";
import { getTranslations } from "next-intl/server";
import { PrismaClient } from "@/generated/prisma";
import Plan from "./components/plan";

const prisma = new PrismaClient();

export default async function OrganizationSubscriptionPage() {
    const t = await getTranslations("organization.subscription");

    const canBillingRead = await hasPermissionAction({
        permissions: { billing: ["read"] },
    });
    if (!canBillingRead) notFound();

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userOrganizations = await auth.api.listOrganizations({
        headers: await headers(),
    });

    const activeUserOrganization = userOrganizations?.find(
        org => org.id === session.session.activeOrganizationId
    );

    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: activeUserOrganization.id,
        },
    });

    const lengthTotalMembres = await prisma.member.count({
        where: {
            organizationId: activeUserOrganization.id,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("page_title")}</CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {!subscription && (
                        <Plan
                            organization={activeUserOrganization}
                            lengthTotalMembres={lengthTotalMembres}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
