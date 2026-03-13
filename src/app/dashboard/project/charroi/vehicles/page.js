import { normalizePlateNumber } from "@project/lib/charroi/utils";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPermission, requirePermission } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import prisma from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { VehiclesManager } from "./components/vehicles-manager";

const VEHICLES_PER_PAGE = 10;

export default async function Page({ searchParams }) {
    const [t, { organization }, resolvedSearchParams] = await Promise.all([
        getTranslations("project.charroi.vehicles"),
        requirePermission({
            permissions: { vehicle: ["read"] },
        }),
        searchParams,
    ]);
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "").trim();
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const normalizedPlateSearchValue = normalizePlateNumber(searchValue);
    const vehicleSearchFilters = searchValue
        ? [
              {
                  plateNumber: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              },
              normalizedPlateSearchValue
                  ? {
                        plateNumberNormalized: {
                            contains: normalizedPlateSearchValue,
                        },
                    }
                  : null,
              {
                  name: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              },
              {
                  brand: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              },
              {
                  model: {
                      contains: searchValue,
                      mode: "insensitive",
                  },
              },
          ].filter(Boolean)
        : [];
    const whereClause = {
        organizationId: organization.id,
        ...(vehicleSearchFilters.length > 0
            ? {
                  OR: vehicleSearchFilters,
              }
            : {}),
    };

    const [canManageVehicles, canManageAssignments, totalVehicles, templates] = await Promise.all([
        checkPermission({
            permissions: { vehicle: ["update"] },
        }),
        checkPermission({
            permissions: { checklistAssignment: ["update"] },
        }),
        prisma.vehicle.count({
            where: whereClause,
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
    const totalPages = Math.ceil(totalVehicles / VEHICLES_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/project/charroi/vehicles",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });
    const offset = (safePage - 1) * VEHICLES_PER_PAGE;
    const vehicles = await prisma.vehicle.findMany({
        where: whereClause,
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
        skip: offset,
        take: VEHICLES_PER_PAGE,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <SearchInput
                    placeholder={t("search_placeholder")}
                    initialValue={searchValue}
                    searchParams={resolvedSearchParams}
                />
                <VehiclesManager
                    canManageAssignments={canManageAssignments}
                    canManageVehicles={canManageVehicles}
                    emptyMessage={searchValue ? t("no_search_results") : t("empty_state")}
                    publicBaseUrl={`${getServerUrl()}/app/checklist`}
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
                <Pagination
                    totalPages={totalPages}
                    page={safePage}
                    searchParams={resolvedSearchParams}
                />
            </CardContent>
        </Card>
    );
}
