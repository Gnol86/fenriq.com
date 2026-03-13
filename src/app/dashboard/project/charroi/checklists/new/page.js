import { ChecklistTemplateBuilder } from "@project/components/charroi/checklist-builder/checklist-template-builder";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

export default async function Page() {
    const t = await getTranslations("project.charroi.builder");
    const { organization } = await requirePermission({
        permissions: { checklist: ["create"] },
    });

    const categories = await prisma.checklistCategory.findMany({
        where: {
            organizationId: organization.id,
            isActive: true,
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
            isActive: true,
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("create_page_title")}</CardTitle>
                <CardDescription>{t("create_page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChecklistTemplateBuilder categories={categories} template={null} />
            </CardContent>
        </Card>
    );
}
