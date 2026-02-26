"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changePasswordAction } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";
import { useServerAction } from "@/hooks/use-server-action";

export default function ChangePasswordForm() {
    const t = useTranslations("user.settings.change_password");
    const tValidation = useTranslations("validation");

    const formSchema = z
        .object({
            currentPassword: z.string().min(1, tValidation("password.required")),
            newPassword: z
                .string()
                .min(8, tValidation("password.min_length"))
                .regex(/(?=.*[a-z])/, tValidation("password.lowercase_required"))
                .regex(/(?=.*[A-Z])/, tValidation("password.uppercase_required"))
                .regex(/(?=.*\d)/, tValidation("password.digit_required")),
            confirmPassword: z.string().min(1, tValidation("password.confirm_required")),
        })
        .refine(data => data.newPassword === data.confirmPassword, {
            message: tValidation("password.mismatch"),
            path: ["confirmPassword"],
        });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { execute, isPending, isSuccess } = useServerAction();

    // Reset form after successful password change
    useEffect(() => {
        if (isSuccess) {
            form.reset();
        }
    }, [isSuccess, form]);

    const onSubmit = async values => {
        await execute(
            () =>
                changePasswordAction({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            {
                successMessage: t("success_message"),
            }
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("current_password_label")}</FormLabel>
                            <FormControl>
                                <PasswordInput disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("new_password_label")}</FormLabel>
                            <FormControl>
                                <PasswordStrengthInput disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("confirm_password_label")}</FormLabel>
                            <FormControl>
                                <PasswordInput disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {t("submit_button")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
