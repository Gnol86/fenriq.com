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
import ImageUpload from "@/components/image-upload";
import { useServerAction } from "@/hooks/use-server-action";
import { updateOrganizationAction } from "@/actions/organization.action";

const formSchema = z.object({
    name: z
        .string()
        .trim()
        .regex(
            /^[\p{L}\p{N} -]+$/u,
            "Le nom ne peut contenir que des lettres, chiffres, espaces ou tirets"
        )
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(80, "Le nom ne peut pas dépasser 80 caractères")
        .refine(value => {
            const alphanumericMatches = value.match(/\p{L}|\p{N}/gu) ?? [];
            return alphanumericMatches.length >= 2;
        }, "Le nom doit contenir au minimum deux caractères alphanumériques"),
});

export default function ManageOrganizationForm({ organization }) {
    const { execute, isPending } = useServerAction();
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
                successMessage: "Organisation mise à jour avec succès",
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
                            <FormLabel>Nom de l&apos;organisation</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Ce nom est visible par tous les membres.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <FormButton type="submit" loading={isPending}>
                        Enregistrer les modifications
                    </FormButton>
                </div>
            </form>
        </Form>
    ) : (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Aucune organisation active n&apos;a été trouvée.</p>
            <p>
                Sélectionnez une organisation dans le menu latéral pour pouvoir
                modifier ses informations.
            </p>
        </div>
    );
}
