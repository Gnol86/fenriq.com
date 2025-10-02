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
import ImageUploadUser from "./image-upload-user";
import { useServerAction } from "@/hooks/use-server-action";
import { updateUserAction } from "@/actions/user.action";
import { useTranslations } from "next-intl";

export default function UserSettingsForm({ user }) {
    const t = useTranslations("user.settings");
    const tValidation = useTranslations("validation.name");
    const { execute, isPending } = useServerAction();

    const formSchema = z.object({
        name: z
            .string()
            .trim()
            .min(2, tValidation("min_length"))
            .max(50, tValidation("max_length")),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name ?? "",
        },
    });

    const onSubmit = async values => {
        await execute(
            () =>
                updateUserAction({
                    name: values.name,
                }),
            {
                successMessage: t("success_message"),
                errorMessage: t("error_message"),
            }
        );
    };

    return user ? (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <ImageUploadUser user={user} />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("name_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    disabled={isPending}
                                    placeholder={t("name_placeholder")}
                                />
                            </FormControl>
                            <FormDescription>
                                {t("name_description")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <FormButton type="submit" loading={isPending}>
                        {t("save_button")}
                    </FormButton>
                </div>
            </form>
        </Form>
    ) : (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>{t("no_user_error")}</p>
            <p>{t("reconnect_message")}</p>
        </div>
    );
}
