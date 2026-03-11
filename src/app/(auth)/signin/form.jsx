"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { authClient } from "@/lib/auth-client";

export default function FormSignin({ initialEmail = "", callbackURL = "/app" }) {
    const recoveryHintThreshold = 3;
    const router = useRouter();
    const t = useTranslations("auth.signin");
    const tValidation = useTranslations("validation");
    const [invalidAttempts, setInvalidAttempts] = useState(0);

    const formSchema = z.object({
        email: z.email(tValidation("email.invalid")).trim(),
        password: z
            .string(tValidation("password.valid_required"))
            .min(1, tValidation("password.required"))
            .trim(),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: initialEmail,
            password: "",
        },
    });
    const emailValue = useWatch({
        control: form.control,
        name: "email",
    });
    const forgotPasswordHref = emailValue
        ? `/forgot-password?email=${encodeURIComponent(emailValue)}`
        : "/forgot-password";
    const showRecoveryHint = invalidAttempts >= recoveryHintThreshold;

    const isInvalidCredentialsError = error =>
        error?.code === "INVALID_EMAIL_OR_PASSWORD" ||
        (error?.status === 401 && error?.message === "Invalid email or password");

    const onSubmit = async values => {
        try {
            await authClient.signIn.email(
                {
                    email: values.email,
                    password: values.password,
                    callbackURL: callbackURL,
                },
                {
                    onSuccess: () => {
                        setInvalidAttempts(0);
                        toast.success(t("success_message"));
                    },
                    onError: ctx => {
                        if (ctx.error.status === 403) {
                            // Rediriger vers la page de vérification avec l'email
                            setInvalidAttempts(0);
                            toast.error(t("error_email_not_verified"));
                            router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
                        } else if (isInvalidCredentialsError(ctx.error)) {
                            setInvalidAttempts(currentAttempts => currentAttempts + 1);
                            toast.error(ctx.error.message || t("error_signin_failed"));
                        } else {
                            setInvalidAttempts(0);
                            toast.error(ctx.error.message || t("error_signin_failed"));
                        }
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("email_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={form.formState.isSubmitting}
                                    type="email"
                                    {...field}
                                    onChange={event => {
                                        setInvalidAttempts(0);
                                        field.onChange(event);
                                    }}
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
                                <PasswordInput
                                    disabled={form.formState.isSubmitting}
                                    {...field}
                                    onChange={event => {
                                        setInvalidAttempts(0);
                                        field.onChange(event);
                                    }}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Link href={forgotPasswordHref}>
                        <Button variant="link" className="h-auto px-0">
                            {t("forgot_password_link")}
                        </Button>
                    </Link>
                </div>
                {showRecoveryHint ? (
                    <div className="flex flex-col gap-2">
                        <Alert variant="destructive">
                            <AlertTitle>{t("invalid_credentials_recovery_title")}</AlertTitle>
                            <AlertDescription>
                                {t("invalid_credentials_recovery_description")}
                            </AlertDescription>
                        </Alert>
                        <Link href={forgotPasswordHref}>
                            <Button type="button" variant="outline" className="w-full">
                                {t("invalid_credentials_recovery_cta")}
                            </Button>
                        </Link>
                    </div>
                ) : null}
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
                    {t("no_account_text")}
                    <Link
                        href={emailValue ? `/signup?email=${emailValue}` : "/signup"}
                        className="text-primary hover:underline"
                    >
                        {t("signup_link")}
                    </Link>
                </div>
            </form>
        </Form>
    );
}
