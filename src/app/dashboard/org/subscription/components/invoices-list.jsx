import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function InvoicesList({ invoices }) {
    const t = await getTranslations("organization.subscription");
    const tCommon = await getTranslations("common");

    const formatDate = date => {
        if (!date) return tCommon("n_a");
        return new Date(date * 1000).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatAmount = (amount, currency) => {
        if (!amount || !currency) return tCommon("n_a");
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const statusColorMap = {
        paid: "bg-green-500",
        open: "bg-blue-500",
        void: "bg-gray-500",
        uncollectible: "bg-red-500",
    };

    return (
        <div className="flex flex-col gap-2">
            {invoices.map(invoice => (
                <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                {t("invoice_number", {
                                    number:
                                        invoice.number ?? invoice.id.slice(-8),
                                })}
                            </span>
                            {invoice.status && (
                                <Badge
                                    className={
                                        statusColorMap[invoice.status] ??
                                        "bg-gray-500"
                                    }
                                >
                                    {t(`invoice_status_${invoice.status}`)}
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {formatDate(invoice.created)} •{" "}
                            {formatAmount(invoice.amount_due, invoice.currency)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {invoice.invoice_pdf && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={invoice.invoice_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="h-4 w-4" />
                                    {t("download_pdf")}
                                </Link>
                            </Button>
                        )}
                        {invoice.hosted_invoice_url && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link
                                    href={invoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
