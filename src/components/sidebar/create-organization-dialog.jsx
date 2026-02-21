"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { createOrganizationAction } from "@/actions/organization.action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { dialogManager } from "@/lib/dialog-manager/dialog-manager";

export default function CreateOrganizationDialog() {
    const t = useTranslations("organization.create_dialog");
    const tValidation = useTranslations("validation.organization_name");

    const handleCreateOrganization = () => {
        dialogManager.input({
            title: t("title"),
            description: t("description"),
            input: {
                label: t("name_label"),
                placeholder: t("name_placeholder"),
            },
            action: {
                label: t("create_button"),
                onClick: async organizationName => {
                    // Validate the input with zod
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

                    const result = formSchema.safeParse({ name: organizationName });

                    if (!result.success) {
                        const firstError = result.error.errors[0];
                        throw new Error(firstError.message);
                    }

                    await createOrganizationAction({
                        name: result.data.name,
                    });
                },
                successMessage: t("success_message"),
            },
        });
    };

    return (
        <DropdownMenuItem closeOnClick={false} onClick={() => handleCreateOrganization()}>
            <Plus className="" aria-hidden="true" />
            {t("trigger_button")}
        </DropdownMenuItem>
    );
}
