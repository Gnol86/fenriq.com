"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { deleteUserAction } from "@/actions/user.action";
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";

export default function DangerZoneForm({ user }) {
    const t = useTranslations("user.danger_zone");
    const tValidation = useTranslations("validation.confirmation");
    const { execute, isPending } = useServerAction();

    const formSchema = z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, tValidation("email_required"))
            .refine(value => value === user.email, {
                message: tValidation("email_mismatch"),
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
        await execute(() => deleteUserAction({ userId: user.id }), {
            successMessage: t("success_message"),
            redirectOnSuccess: "/",
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                    <p className="font-medium">{t("warning_title")}</p>
                    <p className="text-destructive/70">
                        {t("warning_subtitle")}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("confirm_label")}</FormLabel>
                            <FormDescription>
                                {t("confirm_description", {
                                    email: user.email,
                                })}
                            </FormDescription>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    placeholder={user.email}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.formState.isValid && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <FormButton
                                type="button"
                                variant="destructive"
                                loading={isPending}
                                disabled={!form.formState.isValid}
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
                                    {t("alert_description")}
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
