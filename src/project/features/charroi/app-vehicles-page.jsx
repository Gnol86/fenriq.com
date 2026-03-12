import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";

function getVehicleDetails(vehicle, fallbackLabel) {
    const details = [vehicle.name, vehicle.brand, vehicle.model].filter(Boolean);

    return details.length > 0 ? details.join(" · ") : fallbackLabel;
}

export default async function AppVehiclesPage() {
    const [t, { organization }] = await Promise.all([
        getTranslations("project.charroi.vehicles"),
        requirePermission({
            permissions: { vehicle: ["read"] },
        }),
    ]);

    const vehicles = await prisma.vehicle.findMany({
        where: {
            organizationId: organization.id,
        },
        orderBy: {
            plateNumber: "asc",
        },
        select: {
            id: true,
            plateNumber: true,
            name: true,
            brand: true,
            model: true,
            isActive: true,
            assignments: {
                select: {
                    id: true,
                    publicToken: true,
                    isActive: true,
                    checklistTemplate: {
                        select: {
                            id: true,
                            name: true,
                            isActive: true,
                        },
                    },
                },
            },
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {vehicles.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>{t("empty_state")}</EmptyTitle>
                            <EmptyDescription>{t("page_description")}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-4">
                        {vehicles.map(vehicle => {
                            const assignments = [...vehicle.assignments].sort((left, right) =>
                                left.checklistTemplate.name.localeCompare(
                                    right.checklistTemplate.name
                                )
                            );

                            return (
                                <Card key={vehicle.id} size="sm">
                                    <CardHeader>
                                        <CardTitle>{vehicle.plateNumber}</CardTitle>
                                        <CardDescription>
                                            {getVehicleDetails(vehicle, t("no_vehicle_details"))}
                                        </CardDescription>
                                        <CardAction>
                                            <Badge
                                                variant={vehicle.isActive ? "secondary" : "outline"}
                                            >
                                                {vehicle.isActive
                                                    ? t("status_active")
                                                    : t("status_inactive")}
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        {assignments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                {t("no_assignments")}
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {assignments.map(assignment => {
                                                    const isAvailable =
                                                        vehicle.isActive &&
                                                        assignment.isActive &&
                                                        assignment.checklistTemplate.isActive;

                                                    if (!isAvailable) {
                                                        return (
                                                            <Badge
                                                                key={assignment.id}
                                                                variant="outline"
                                                            >
                                                                {assignment.checklistTemplate.name}{" "}
                                                                · {t("status_inactive")}
                                                            </Badge>
                                                        );
                                                    }

                                                    return (
                                                        <Button
                                                            key={assignment.id}
                                                            nativeButton={false}
                                                            render={
                                                                <Link
                                                                    href={`/app/checklist/${assignment.publicToken}`}
                                                                />
                                                            }
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            {assignment.checklistTemplate.name}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
