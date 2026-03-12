import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPermission, requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { VehiclesManager } from "./vehicles-manager";

export default async function CharroiVehiclesPage() {
    const t = await getTranslations("project.charroi.vehicles");
    const { organization } = await requirePermission({
        permissions: { vehicle: ["read"] },
    });

    const [canManageVehicles, canManageAssignments, vehicles, templates] = await Promise.all([
        checkPermission({
            permissions: { vehicle: ["update"] },
        }),
        checkPermission({
            permissions: { checklistAssignment: ["update"] },
        }),
        prisma.vehicle.findMany({
            where: {
                organizationId: organization.id,
            },
            orderBy: [
                {
                    plateNumber: "asc",
                },
            ],
            include: {
                assignments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        checklistTemplate: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.checklistTemplate.findMany({
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
                <VehiclesManager
                    canManageAssignments={canManageAssignments}
                    canManageVehicles={canManageVehicles}
                    publicBaseUrl={`${getServerUrl()}/checklists`}
                    templates={templates}
                    vehicles={vehicles.map(vehicle => ({
                        id: vehicle.id,
                        plateNumber: vehicle.plateNumber,
                        name: vehicle.name ?? "",
                        brand: vehicle.brand ?? "",
                        model: vehicle.model ?? "",
                        isActive: vehicle.isActive,
                        assignments: vehicle.assignments.map(assignment => ({
                            id: assignment.id,
                            checklistTemplateId: assignment.checklistTemplateId,
                            checklistName: assignment.checklistTemplate.name,
                            isActive: assignment.isActive,
                            publicToken: assignment.publicToken,
                        })),
                    }))}
                />
            </CardContent>
        </Card>
    );
}
