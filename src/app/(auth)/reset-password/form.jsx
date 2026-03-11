"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordStrengthInput } from "@/components/password-strength-input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";

function getAuthErrorMessage(error) {
    if (typeof error?.message === "string") {
        return error.message;
    }

    if (typeof error?.error?.message === "string") {
        return error.error.message;
    }

    return "";
}

export default function FormResetPassword({ token, initialEmail = "" }) {
    const router = useRouter();
    const t = useTranslations("auth.reset_password");
    const tValidation = useTranslations("validation");

    const formSchema = z
        .object({
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
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async values => {
        try {
            await authClient.resetPassword({
                token,
                newPassword: values.newPassword,
            });

            toast.success(t("success_message"));
            const signInHref = initialEmail
                ? `/signin?email=${encodeURIComponent(initialEmail)}`
                : "/signin";
            router.push(signInHref);
        } catch (error) {
            const errorMessage = getAuthErrorMessage(error);

            if (errorMessage === "Invalid token") {
                const searchParams = new URLSearchParams({
                    error: "INVALID_TOKEN",
                });

                if (initialEmail) {
                    searchParams.set("email", initialEmail);
                }

                router.replace(`/reset-password?${searchParams.toString()}`);
                return;
            }

            console.error("Reset password form submission error", error);
            toast.error(t("error_message"));
        }
    };

    const signInHref = initialEmail
        ? `/signin?email=${encodeURIComponent(initialEmail)}`
        : "/signin";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("new_password_label")}</FormLabel>
                            <FormControl>
                                <PasswordStrengthInput
                                    disabled={form.formState.isSubmitting}
                                    {...field}
                                />
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
                                <PasswordInput disabled={form.formState.isSubmitting} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2">
                    <FormButton
                        type="submit"
                        loading={form.formState.isSubmitting}
                        className="flex-1"
                    >
                        {t("submit_button")}
                    </FormButton>
                    <Link href={signInHref}>
                        <Button variant="ghost">{t("back_to_signin_button")}</Button>
                    </Link>
                </div>
            </form>
        </Form>
    );
}
