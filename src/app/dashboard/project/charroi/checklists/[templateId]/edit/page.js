import { ChecklistTemplateBuilder } from "@project/components/charroi/checklist-builder/checklist-template-builder";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

export default async function Page({ params }) {
    const { templateId } = await params;
    const t = await getTranslations("project.charroi.builder");
    const { organization } = await requirePermission({
        permissions: { checklist: ["update"] },
    });

    const [categories, template] = await Promise.all([
        prisma.checklistCategory.findMany({
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
        }),
        prisma.checklistTemplate.findFirst({
            where: {
                id: templateId,
                organizationId: organization.id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                version: true,
                isActive: true,
                schemaJson: true,
            },
        }),
    ]);

    if (!template) {
        notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("edit_page_title", { name: template.name })}</CardTitle>
                <CardDescription>{t("edit_page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChecklistTemplateBuilder categories={categories} template={template} />
            </CardContent>
        </Card>
    );
}
