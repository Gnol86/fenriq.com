import { getTranslations } from "next-intl/server";
import { UserPlus, UserMinus, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Item,
    ItemDescription,
    ItemHeader,
    ItemTitle,
} from "@/components/ui/item";

export default async function LicenseMovements({ movements }) {
    const t = await getTranslations("organization.subscription");
    const tCommon = await getTranslations("common");

    if (!movements) {
        return null;
    }

    const formatDate = date => {
        if (!date) return tCommon("n_a");
        return new Date(date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatAmount = (amount, currency) => {
        if (amount === undefined || amount === null || !currency) {
            return tCommon("n_a");
        }

        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatSignedAmount = amount => {
        const formatted = formatAmount(amount, movements.currency);
        if (formatted === tCommon("n_a")) {
            return formatted;
        }

        if (amount > 0) {
            return `+${formatted}`;
        }

        return formatted;
    };

    const groupMovements = entries => {
        if (!entries?.length) {
            return [];
        }

        const map = new Map();

        for (const entry of entries) {
            const key = entry.lineId ?? entry.id;
            const occurredAt = entry.addedAt ?? entry.removedAt ?? entry.occurredAt;

            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    occurredAt,
                    description: entry.description ?? null,
                    amounts: [],
                });
            }

            const group = map.get(key);
            group.amounts.push(entry.amount);
            group.totalAmount = (group.totalAmount ?? 0) + entry.amount;
            group.count = (group.count ?? 0) + 1;
        }

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.occurredAt) - new Date(b.occurredAt)
        );
    };

    const hasChanges =
        movements.addedMembers.length > 0 || movements.removedCount > 0;

    const groupedAdded = groupMovements(movements.addedMembers);
    const groupedRemoved = groupMovements(movements.removedMembers);

    // Calculate base subscription amount for next invoice
    const baseAmount = (movements.amount ?? 0) * movements.currentSeats;

    return (
        <div className="flex flex-col gap-6">
            {/* Billing Period Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {t("billing_period_title")}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Last billing date */}
                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">
                            {t("last_billing_date")}
                        </div>
                        <div className="text-lg font-semibold">
                            {formatDate(movements.lastInvoiceDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t("invoice_number", {
                                number: movements.lastInvoiceNumber,
                            })}
                        </div>
                    </div>

                    {/* Next billing date */}
                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">
                            {t("next_billing_date")}
                        </div>
                        <div className="text-lg font-semibold">
                            {formatDate(movements.nextBillingDate)}
                        </div>
                    </div>
                </div>
            </div>

            {/* License Summary */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Licenses at start of period */}
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex flex-col gap-0.5">
                            <div className="text-xs text-muted-foreground">
                                {t("licenses_at_start")}
                            </div>
                            <div className="text-2xl font-semibold">
                                {movements.lastInvoiceQuantity}
                            </div>
                        </div>
                    </div>

                    {/* Current licenses */}
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex flex-col gap-0.5">
                            <div className="text-xs text-muted-foreground">
                                {t("current_licenses")}
                            </div>
                            <div className="text-2xl font-semibold">
                                {movements.currentSeats}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements Details */}
            {hasChanges ? (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-medium">
                        {t("movements_details")}
                    </div>
                    {/* Added licenses */}
                    {groupedAdded.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                    {t("licenses_added", {
                                        count: movements.addedMembers.length,
                                    })}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {groupedAdded.map(group => (
                                    <Item
                                        variant="muted"
                                        key={group.id}
                                        size="sm"
                                    >
                                        <ItemHeader>
                                            <ItemTitle>
                                                {formatSignedAmount(
                                                    group.totalAmount
                                                )}
                                            </ItemTitle>
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant="outline">
                                                    {t("licenses_added", {
                                                        count: group.count,
                                                    })}
                                                </Badge>
                                            </div>
                                            <ItemDescription>
                                                {t("license_added_on", {
                                                    date: formatDate(
                                                        group.occurredAt
                                                    ),
                                                })}
                                            </ItemDescription>
                                            {group.description && (
                                                <ItemDescription className="text-xs text-muted-foreground">
                                                    {group.description}
                                                </ItemDescription>
                                            )}
                                            {group.amounts.length > 0 && (
                                                <ItemDescription className="text-xs text-muted-foreground">
                                                    {t(
                                                        "license_amounts_detail",
                                                        {
                                                            count: group.count,
                                                            amounts: group.amounts
                                                                .map(value =>
                                                                    formatSignedAmount(
                                                                        value
                                                                    )
                                                                )
                                                                .join(" • "),
                                                        }
                                                    )}
                                                </ItemDescription>
                                            )}
                                        </ItemHeader>
                                    </Item>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Removed licenses */}
                    {groupedRemoved.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <UserMinus className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                    {t("licenses_removed", {
                                        count: movements.removedMembers.length,
                                    })}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {groupedRemoved.map(group => (
                                    <Item
                                        variant="muted"
                                        key={group.id}
                                        size="sm"
                                    >
                                        <ItemHeader>
                                            <ItemTitle>
                                                <span className="text-green-600">
                                                    {formatSignedAmount(
                                                        group.totalAmount
                                                    )}
                                                </span>
                                            </ItemTitle>
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant="outline">
                                                    {t("licenses_removed", {
                                                        count: group.count,
                                                    })}
                                                </Badge>
                                            </div>
                                            <ItemDescription>
                                                {t("license_removed_on", {
                                                    date: formatDate(
                                                        group.occurredAt
                                                    ),
                                                })}
                                            </ItemDescription>
                                            {group.description && (
                                                <ItemDescription className="text-xs text-muted-foreground">
                                                    {group.description}
                                                </ItemDescription>
                                            )}
                                            {group.amounts.length > 0 && (
                                                <ItemDescription className="text-xs text-muted-foreground">
                                                    {t(
                                                        "license_amounts_detail",
                                                        {
                                                            count: group.count,
                                                            amounts: group.amounts
                                                                .map(value =>
                                                                    formatSignedAmount(
                                                                        value
                                                                    )
                                                                )
                                                                .join(" • "),
                                                        }
                                                    )}
                                                </ItemDescription>
                                            )}
                                        </ItemHeader>
                                    </Item>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {t("no_movements")}
                </div>
            )}

            {/* Next Invoice Calculation */}
            <div className="flex flex-col gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4" />
                    {t("next_invoice_calculation", {
                        date: formatDate(movements.nextBillingDate),
                    })}
                </div>

                <div className="flex flex-col gap-2">
                    {/* Base subscription */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t("base_subscription")} ({movements.currentSeats} ×{" "}
                            {formatAmount(movements.amount, movements.currency)}
                            )
                        </span>
                        <span className="font-medium">
                            {formatAmount(baseAmount, movements.currency)}
                        </span>
                    </div>

                    {/* Adjustments */}
                    {hasChanges && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t("adjustments")}
                                </span>
                                <span
                                    className={`font-medium ${
                                        movements.netAmountToPay > 0
                                            ? "text-orange-600"
                                            : movements.netAmountToPay < 0
                                              ? "text-green-600"
                                              : ""
                                    }`}
                                >
                                    {movements.netAmountToPay > 0 && "+"}
                                    {formatAmount(
                                        movements.netAmountToPay,
                                        movements.currency
                                    )}
                                </span>
                            </div>
                            <div className="border-t pt-2" />
                        </>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">
                            {t("total_next_invoice")}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                            {formatAmount(
                                baseAmount + movements.netAmountToPay,
                                movements.currency
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
