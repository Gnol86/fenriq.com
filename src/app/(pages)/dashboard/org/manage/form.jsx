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
import ImageUpload from "./image-upload-orgs";
import { useServerAction } from "@/hooks/use-server-action";
import { updateOrganizationAction } from "@/actions/organization.action";
import { useTranslations } from "next-intl";

export default function ManageOrganizationForm({ organization }) {
    const t = useTranslations("organization.manage");
    const tValidation = useTranslations("validation.organization_name");
    const { execute, isPending } = useServerAction();

    const formSchema = z.object({
        name: z
            .string()
            .trim()
            .regex(/^[\p{L}\p{N} -]+$/u, tValidation("pattern"))
            .min(2, tValidation("min_length"))
            .max(80, tValidation("max_length"))
            .refine(value => {
                const alphanumericMatches = value.match(/\p{L}|\p{N}/gu) ?? [];
                return alphanumericMatches.length >= 2;
            }, tValidation("min_alphanumeric")),
    });

    const organizationName = organization?.name ?? "";
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: organizationName,
        },
    });

    const onSubmit = async values => {
        await execute(
            () =>
                updateOrganizationAction({
                    name: values.name,
                    organizationId: organization.id,
                }),
            {
                successMessage: t("success_message"),
            }
        );
    };

    return organization ? (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <ImageUpload organization={organization} />

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
            <p>{t("no_org_error")}</p>
            <p>{t("select_org_message")}</p>
        </div>
    );
}
