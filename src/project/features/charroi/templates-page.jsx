import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPermission, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { TemplatesManager } from "./templates-manager";

export default async function CharroiTemplatesPage() {
    const t = await getTranslations("project.charroi.checklists");
    const { organization } = await requirePermission({
        permissions: { checklist: ["read"] },
    });

    const [canCreate, canManage, templates] = await Promise.all([
        checkPermission({
            permissions: { checklist: ["create"] },
        }),
        checkPermission({
            permissions: { checklist: ["update"] },
        }),
        prisma.checklistTemplate.findMany({
            where: {
                organizationId: organization.id,
            },
            orderBy: {
                name: "asc",
            },
            include: {
                assignments: {
                    select: {
                        id: true,
                    },
                },
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
                <TemplatesManager
                    canCreate={canCreate}
                    canManage={canManage}
                    templates={templates.map(template => ({
                        id: template.id,
                        name: template.name,
                        description: template.description ?? "",
                        version: template.version,
                        isActive: template.isActive,
                        fieldsCount: template.schemaJson.sections.reduce(
                            (total, section) => total + section.fields.length,
                            0
                        ),
                        rulesCount: template.schemaJson.rules.length,
                        assignmentsCount: template.assignments.length,
                    }))}
                />
            </CardContent>
        </Card>
    );
}
