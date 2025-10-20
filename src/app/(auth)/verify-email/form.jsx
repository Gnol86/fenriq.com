"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import FormButton from "@/components/ui/form-button";
import { useTranslations } from "next-intl";

export default function FormResendVerification() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const t = useTranslations("auth.verify_email");
    const tValidation = useTranslations("validation");

    const formSchema = z.object({
        email: z.email(tValidation("email.invalid")).trim(),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: email || "",
        },
    });

    const onSubmit = async values => {
        try {
            await authClient.sendVerificationEmail({
                email: values.email,
                callbackURL: "/email-verified",
            });

            toast.success(t("success_message"));
        } catch (error) {
            console.error(t("error_log"), error);
            toast.error(t("error_message"));
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
                                    disabled={true}
                                    type="email"
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
                    <Link href="/signin">
                        <Button variant="ghost">{t("back_button")}</Button>
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs">
                    {t("already_verified_text")}
                    <Link
                        href="/signin"
                        className="text-primary hover:underline"
                    >
                        {t("signin_link")}
                    </Link>
                </div>
            </form>
        </Form>
    );
}
