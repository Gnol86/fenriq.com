"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
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
import { authClient } from "@/lib/auth-client";

export default function FormSignin({ initialEmail = "", callbackURL = "/app" }) {
    const router = useRouter();
    const t = useTranslations("auth.signin");
    const tValidation = useTranslations("validation");

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
                        toast.success(t("success_message"));
                    },
                    onError: ctx => {
                        if (ctx.error.status === 403) {
                            // Rediriger vers la page de vérification avec l'email
                            toast.error(t("error_email_not_verified"));
                            router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
                        } else {
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
                                <PasswordInput disabled={form.formState.isSubmitting} {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Link
                        href={
                            emailValue ? `/forgot-password?email=${emailValue}` : "/forgot-password"
                        }
                    >
                        <Button variant="link" className="h-auto px-0">
                            {t("forgot_password_link")}
                        </Button>
                    </Link>
                </div>
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
