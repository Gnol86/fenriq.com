"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";
import { authClient } from "@/lib/auth-client";

export default function FormSignup() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const t = useTranslations("auth.signup");
    const tValidation = useTranslations("validation");

    const formSchema = z
        .object({
            name: z
                .string()
                .min(2, tValidation("name.min_length"))
                .max(50, tValidation("name.max_length")),
            email: z.email(tValidation("email.invalid")),
            password: z
                .string()
                .min(8, tValidation("password.min_length"))
                .regex(
                    /(?=.*[a-z])/,
                    tValidation("password.lowercase_required")
                )
                .regex(
                    /(?=.*[A-Z])/,
                    tValidation("password.uppercase_required")
                )
                .regex(/(?=.*\d)/, tValidation("password.digit_required")),
            password_confirm: z
                .string()
                .min(1, tValidation("password.confirm_required")),
        })
        .refine(data => data.password === data.password_confirm, {
            message: tValidation("password.mismatch"),
            path: ["password_confirm"],
        });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: email || "",
            password: "",
            password_confirm: "",
        },
    });

    const onSubmit = async values => {
        try {
            await authClient.signUp.email(
                {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    callbackURL: "/email-verified",
                },
                {
                    onSuccess: () => {
                        toast.success(t("success_message"));
                        router.push(`/verify-email?email=${values.email}`);
                    },
                    onError: ctx => {
                        toast.error(ctx.error.message || t("error_submission"));
                    },
                }
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error(t("error_try_again"));
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("name_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={form.formState.isSubmitting}
                                    type="text"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("email_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={form.formState.isSubmitting}
                                    type="email"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("password_label")}</FormLabel>
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
                    name="password_confirm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("password_confirm_label")}</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    disabled={form.formState.isSubmitting}
                                    {...field}
                                />
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
                    <Link href="/">
                        <Button variant="ghost">{t("cancel_button")}</Button>
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                    {t("already_account_text")}
                    <Link
                        href={
                            form.watch("email")
                                ? `/signin?email=${form.watch("email")}`
                                : "/signin"
                        }
                        className="text-primary hover:underline"
                    >
                        {t("signin_link")}
                    </Link>
                </div>
            </form>
        </Form>
    );
}
