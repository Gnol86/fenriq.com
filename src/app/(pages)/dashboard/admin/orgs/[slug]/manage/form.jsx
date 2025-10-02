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
import ImageProfile from "@/components/image-profile";
import { useServerAction } from "@/hooks/use-server-action";
import { updateOrganizationAction } from "@/actions/admin.action";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export default function AdminManageOrganizationForm({ organization }) {
    const { execute, isPending } = useServerAction();
    const router = useRouter();
    const organizationName = organization?.name ?? "";
    const tAdminManage = useTranslations("admin.org_manage");
    const tOrgManage = useTranslations("organization.manage");
    const tValidation = useTranslations("validation.organization_name");

    const formSchema = useMemo(
        () =>
            z.object({
                name: z
                    .string()
                    .trim()
                    .regex(
                        /^[\p{L}\p{N} -]+$/u,
                        tValidation("pattern")
                    )
                    .min(2, tValidation("min_length"))
                    .max(80, tValidation("max_length"))
                    .refine(value => {
                        const alphanumericMatches =
                            value.match(/\p{L}|\p{N}/gu) ?? [];
                        return alphanumericMatches.length >= 2;
                    }, tValidation("min_alphanumeric")),
            }),
        [tValidation]
    );

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
                    organizationId: organization.id,
                    data: {
                        name: values.name,
                    },
                }),
            {
                successMessage: tAdminManage("success_message"),
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    };

    return organization ? (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <section className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-foreground">
                        {tAdminManage("image_section_title")}
                    </p>
                    <div className="flex items-center gap-4">
                        <ImageProfile entity={organization} size="2xl" />
                        <div className="flex flex-col text-sm text-muted-foreground">
                            <span>{tAdminManage("image_section_info_1")}</span>
                            <span>{tAdminManage("image_section_info_2")}</span>
                        </div>
                    </div>
                </section>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tOrgManage("name_label")}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                {tOrgManage("name_description")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <FormButton type="submit" loading={isPending}>
                        {tAdminManage("submit_button")}
                    </FormButton>
                </div>
            </form>
        </Form>
    ) : (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>{tAdminManage("not_found_title")}</p>
            <p>{tAdminManage("not_found_description")}</p>
        </div>
    );
}
