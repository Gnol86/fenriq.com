"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changeEmailAction } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
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
import { useServerAction } from "@/hooks/use-server-action";

export default function ChangeEmailForm({ currentEmail }) {
    const t = useTranslations("user.settings.change_email");
    const tValidation = useTranslations("validation.email");
    const normalizedCurrentEmail = currentEmail.trim().toLowerCase();

    const formSchema = z.object({
        newEmail: z
            .string()
            .trim()
            .email(tValidation("invalid"))
            .refine(email => email.toLowerCase() !== normalizedCurrentEmail, {
                message: t("same_email_error"),
            }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newEmail: "",
        },
    });

    const { execute, isPending } = useServerAction();

    const onSubmit = async values => {
        const result = await execute(() => changeEmailAction({ newEmail: values.newEmail }), {
            successMessage: t("success_message"),
            errorMessage: t("error_message"),
            refreshOnSuccess: false,
        });

        if (result.success) {
            form.reset();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("new_email_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t("new_email_placeholder")}
                                    disabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {t("current_email_description", { email: currentEmail })}{" "}
                                {t("new_email_description")}
                            </FormDescription>
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
