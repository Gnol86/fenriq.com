"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUserAction } from "@/actions/user.action";
import ChangeInput from "@/components/change-input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useServerAction } from "@/hooks/use-server-action";

export default function UserSettingsForm({ user }) {
    const t = useTranslations("user.settings");
    const tValidation = useTranslations("validation.name");
    const { execute, isPending, isSuccess } = useServerAction();

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
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <ChangeInput
                                    label={t("name_label")}
                                    description={t("name_description")}
                                    loading={isPending}
                                    isSuccess={isSuccess}
                                    type="text"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    ) : (
        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
            <p>{t("no_user_error")}</p>
            <p>{t("reconnect_message")}</p>
        </div>
    );
}
