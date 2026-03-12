import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPermission, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { CategoriesManager } from "./categories-manager";

export default async function CharroiCategoriesPage() {
    const t = await getTranslations("project.charroi.categories");
    const { organization } = await requirePermission({
        permissions: { checklistCategory: ["read"] },
    });

    const [canManage, categories] = await Promise.all([
        checkPermission({
            permissions: { checklistCategory: ["update"] },
        }),
        prisma.checklistCategory.findMany({
            where: {
                organizationId: organization.id,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                description: true,
                defaultDeliveryMode: true,
                defaultDigestCron: true,
                timeZone: true,
                isActive: true,
            },
        }),
    ]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <CategoriesManager canManage={canManage} categories={categories} />
            </CardContent>
        </Card>
    );
}
