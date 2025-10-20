"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormButton from "@/components/ui/form-button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOrganizationAction } from "@/actions/organization.action";
import { useServerAction } from "@/hooks/use-server-action";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DangerZoneForm({
    organization,
    hasActiveSubscription,
}) {
    const t = useTranslations("organization.danger_zone");
    const tValidation = useTranslations("validation.confirmation");
    const { execute, isPending } = useServerAction();

    const formSchema = z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, tValidation("org_name_required"))
            .refine(value => value === organization.name, {
                message: tValidation("org_name_mismatch"),
            }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            confirmation: "",
        },
    });

    const onSubmit = async () => {
        // Empêcher la soumission automatique du formulaire
        return false; // Ne pas soumettre le formulaire
    };

    const handleDeleteConfirmation = async () => {
        await execute(
            () =>
                deleteOrganizationAction({
                    organizationId: organization.id,
                }),
            {
                successMessage: t("success_message"),
                redirectOnSuccess: "/dashboard",
            }
        );
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                {hasActiveSubscription ? (
                    <div className="rounded-md border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
                        <p className="font-medium">
                            {t("subscription_warning_title")}
                        </p>
                        <p className="text-yellow-600/70 dark:text-yellow-400/70">
                            {t("subscription_warning_description")}
                        </p>
                    </div>
                ) : (
                    <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                        <p className="font-medium">
                            {t("warning_title", { name: organization.name })}
                        </p>
                        <p className="text-destructive/70">
                            {t("warning_subtitle")}
                        </p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("confirm_label")}</FormLabel>
                            <FormDescription>
                                {t("confirm_description", {
                                    name: organization.name,
                                })}
                            </FormDescription>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    placeholder={organization.name}
                                    disabled={
                                        isPending || hasActiveSubscription
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.formState.isValid && !hasActiveSubscription && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <FormButton
                                type="button"
                                variant="destructive"
                                loading={isPending}
                                disabled={
                                    !form.formState.isValid ||
                                    hasActiveSubscription
                                }
                            >
                                <TriangleAlert /> {t("delete_button")}
                                <TriangleAlert />
                            </FormButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("alert_title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("alert_description", {
                                        name: organization.name,
                                    })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {t("alert_cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteConfirmation}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {t("alert_confirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </form>
        </Form>
    );
}
