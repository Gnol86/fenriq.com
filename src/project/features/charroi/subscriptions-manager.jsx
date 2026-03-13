"use client";

import { updateMyChecklistSubscriptionAction } from "@project/actions/charroi.action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useServerAction } from "@/hooks/use-server-action";

export function SubscriptionsManager({ categories, emptyMessage, subscriptionsByCategoryId }) {
    const t = useTranslations("project.charroi.subscriptions");
    const { execute, isPending } = useServerAction();
    const [pendingCategoryId, setPendingCategoryId] = useState(null);

    const updateCategorySubscription = async ({ categoryId, isActive, deliveryModeOverride }) => {
        setPendingCategoryId(categoryId);

        await execute(
            () =>
                updateMyChecklistSubscriptionAction({
                    categoryId,
                    isActive,
                    deliveryModeOverride,
                }),
            {
                successMessage: t("subscription_updated"),
            }
        );

        setPendingCategoryId(null);
    };

    return (
        <div className="flex flex-col gap-3">
            {categories.length === 0 ? (
                <p className="text-muted-foreground text-sm">{emptyMessage ?? t("empty_state")}</p>
            ) : (
                categories.map(category => {
                    const subscription = subscriptionsByCategoryId[category.id] ?? null;
                    const currentOverride = subscription?.deliveryModeOverride ?? "__default__";
                    const isActive = subscription?.isActive ?? false;
                    const currentPending = isPending && pendingCategoryId === category.id;

                    return (
                        <div
                            key={category.id}
                            className="flex flex-col gap-3 rounded-lg border p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{category.name}</span>
                                    <span className="text-muted-foreground text-sm">
                                        {category.description || t("no_description")}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {category.defaultDeliveryMode === "IMMEDIATE"
                                            ? t("default_immediate")
                                            : t("default_digest", {
                                                  cron: category.defaultDigestCron || t("no_cron"),
                                              })}
                                    </span>
                                </div>
                                <Switch
                                    checked={isActive}
                                    disabled={currentPending}
                                    onCheckedChange={checked =>
                                        updateCategorySubscription({
                                            categoryId: category.id,
                                            isActive: checked,
                                            deliveryModeOverride:
                                                subscription?.deliveryModeOverride ?? null,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">{t("override_label")}</span>
                                <Select
                                    value={currentOverride}
                                    onValueChange={value =>
                                        updateCategorySubscription({
                                            categoryId: category.id,
                                            isActive,
                                            deliveryModeOverride:
                                                value === "__default__" ? null : value,
                                        })
                                    }
                                    disabled={currentPending || !isActive}
                                >
                                    <SelectTrigger>
                                        <SelectValue>
                                            {currentOverride === "__default__"
                                                ? t("override_default")
                                                : currentOverride === "IMMEDIATE"
                                                  ? t("override_immediate")
                                                  : t("override_digest")}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__default__">
                                            {t("override_default")}
                                        </SelectItem>
                                        <SelectItem value="IMMEDIATE">
                                            {t("override_immediate")}
                                        </SelectItem>
                                        <SelectItem
                                            value="DIGEST"
                                            disabled={!category.defaultDigestCron}
                                        >
                                            {t("override_digest")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {!category.defaultDigestCron && (
                                    <p className="text-muted-foreground text-xs">
                                        {t("digest_unavailable")}
                                    </p>
                                )}
                            </div>
                            {currentPending && (
                                <Button type="button" disabled size="sm" variant="outline">
                                    {t("saving")}
                                </Button>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
