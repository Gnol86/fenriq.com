"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { authClient } from "@/lib/auth-client";
import { getServerUrl } from "@/lib/server-url";

export default function FormForgotPassword({ initialEmail = "" }) {
    const t = useTranslations("auth.forgot_password");
    const tValidation = useTranslations("validation");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const formSchema = z.object({
        email: z.email(tValidation("email.invalid")).trim(),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: initialEmail,
        },
    });

    const onSubmit = async values => {
        try {
            const redirectTo = new URL("/reset-password", getServerUrl());
            redirectTo.searchParams.set("email", values.email);

            await authClient.requestPasswordReset({
                email: values.email,
                redirectTo: redirectTo.toString(),
            });

            setIsSubmitted(true);
            toast.success(t("success_message"));
        } catch (error) {
            console.error("Forgot password form submission error", error);
            toast.error(t("error_message"));
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

                {isSubmitted ? (
                    <Alert>
                        <AlertTitle>{t("success_title")}</AlertTitle>
                        <AlertDescription>{t("success_message")}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="flex gap-2">
                    <FormButton
                        type="submit"
                        loading={form.formState.isSubmitting}
                        className="flex-1"
                    >
                        {t("submit_button")}
                    </FormButton>
                    <Link href="/signin">
                        <Button variant="ghost">{t("back_button")}</Button>
                    </Link>
                </div>
            </form>
        </Form>
    );
}
