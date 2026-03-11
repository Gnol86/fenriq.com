import { getTranslations } from "next-intl/server";
import { getPlansAction } from "@/actions/plan.action";
import { Pagination } from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/access-control";
import {
    ensureValidListPage,
    getLastSearchParamValue,
    getPageParamState,
} from "@/lib/list-page-search-params";
import DeletePlanButton from "./components/delete-plan-button";
import EditPlanButton from "./components/edit-plan-button";
import PlanForm from "./components/plan-form";

const PLANS_PER_PAGE = 10;

export default async function AdminPlansPage({ searchParams }) {
    const t = await getTranslations("admin.plans");

    // Vérifie que l'utilisateur est admin
    await requireAdmin();

    const resolvedSearchParams = await searchParams;
    const searchValue = getLastSearchParamValue(resolvedSearchParams?.search, "");
    const { page, shouldRedirect } = getPageParamState(resolvedSearchParams);
    const offset = (page - 1) * PLANS_PER_PAGE;

    const { plans, total } = await getPlansAction({
        searchValue,
        limit: PLANS_PER_PAGE,
        offset,
    });
    const totalPages = Math.ceil(total / PLANS_PER_PAGE);
    const safePage = ensureValidListPage({
        pathname: "/dashboard/admin/plans",
        searchParams: resolvedSearchParams,
        page,
        totalPages,
        forceRedirect: shouldRedirect,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("page_title")}</CardTitle>
                <CardDescription>{t("page_description")}</CardDescription>
                <CardAction>
                    <PlanForm />
                </CardAction>
            </CardHeader>

            <CardContent className="flex w-full flex-col gap-4">
                <SearchInput
                    placeholder={t("search_placeholder")}
                    initialValue={searchValue}
                    searchParams={resolvedSearchParams}
                />
                <Table>
                    {!plans.length && (
                        <TableCaption>
                            {searchValue ? t("no_search_results") : t("no_plans")}
                        </TableCaption>
                    )}
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("table_name")}</TableHead>
                            <TableHead>{t("table_price_id")}</TableHead>
                            <TableHead>{t("table_annual_discount")}</TableHead>
                            <TableHead>{t("table_limits")}</TableHead>
                            <TableHead>{t("table_free_trial")}</TableHead>
                            <TableHead>{t("table_show_in_pricing")}</TableHead>
                            <TableHead>{t("table_actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map(plan => {
                            // Parser les limites JSON
                            let limits = {};
                            try {
                                if (plan.limits) {
                                    limits = JSON.parse(plan.limits);
                                }
                            } catch (e) {
                                console.error("Error parsing limits:", e);
                            }

                            // Parser le free trial JSON
                            let freeTrialDays = null;
                            try {
                                if (plan.freeTrial) {
                                    const freeTrialObj = JSON.parse(plan.freeTrial);
                                    freeTrialDays = freeTrialObj.days;
                                }
                            } catch (e) {
                                console.error("Error parsing freeTrial:", e);
                            }

                            // Formatter les limites pour l'affichage
                            const limitsDisplay =
                                Object.keys(limits).length > 0
                                    ? Object.entries(limits)
                                          .map(([key, value]) => `${key}: ${value}`)
                                          .join(", ")
                                    : t("limit_not_set");

                            // Formatter le free trial pour l'affichage
                            const freeTrialDisplay = freeTrialDays
                                ? t("free_trial_days", { days: freeTrialDays })
                                : t("free_trial_not_set");

                            // Formatter showInPricingPage pour l'affichage
                            const showInPricingDisplay = plan.showInPricingPage
                                ? t("show_in_pricing_yes")
                                : t("show_in_pricing_no");

                            return (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {plan.priceId}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {plan.annualDiscountPriceId || t("limit_not_set")}
                                    </TableCell>
                                    <TableCell className="text-sm">{limitsDisplay}</TableCell>
                                    <TableCell>{freeTrialDisplay}</TableCell>
                                    <TableCell>{showInPricingDisplay}</TableCell>
                                    <TableCell>
                                        <ButtonGroup>
                                            <EditPlanButton plan={plan} />
                                            <DeletePlanButton
                                                planId={plan.id}
                                                planName={plan.name}
                                            />
                                        </ButtonGroup>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <Pagination
                    totalPages={totalPages}
                    page={safePage}
                    searchParams={resolvedSearchParams}
                />
            </CardContent>
        </Card>
    );
}
