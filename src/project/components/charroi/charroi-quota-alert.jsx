"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

export function CharroiQuotaAlert({ quotaStatus }) {
    const t = useTranslations("project.charroi.quota");

    if (!quotaStatus?.lockReason) {
        return null;
    }

    const isOverQuota = quotaStatus.isOverQuota;

    return (
        <Alert variant={isOverQuota ? "destructive" : "default"}>
            <AlertTriangle className="size-4" />
            <AlertTitle>{isOverQuota ? t("over_limit_title") : t("at_limit_title")}</AlertTitle>
            <AlertDescription>
                {isOverQuota
                    ? t("over_limit_description", {
                          limit: quotaStatus.limit,
                          used: quotaStatus.used,
                      })
                    : t("at_limit_description", {
                          limit: quotaStatus.limit,
                          used: quotaStatus.used,
                      })}
            </AlertDescription>
            <AlertAction>
                <Link
                    href="/dashboard/org/subscription"
                    className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                    })}
                >
                    {t("manage_subscription_cta")}
                </Link>
            </AlertAction>
        </Alert>
    );
}
