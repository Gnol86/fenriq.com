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
import { updateOrganizationAction } from "@/actions/organisations.action";
import ImageProfile from "@/components/image-profile";
import { useServerAction } from "@/hooks/use-server-action";

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
    const { execute } = useServerAction();
    const organizationName = organization?.name ?? "";
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: organizationName,
        },
    });

    const onSubmit = async values => {
        if (!organization?.id) {
            await execute(
                () =>
                    Promise.reject(
                        new Error(
                            "Aucune organisation active n'a été trouvée. Veuillez en sélectionner une."
                        )
                    ),
                {
                    showToast: true,
                    refreshOnSuccess: false,
                }
            );
            return;
        }

        await execute(
            () =>
                updateOrganizationAction({
                    organizationId: organization.id,
                    name: values.name,
                }),
            {
                loadingMessage: "Mise à jour de l'organisation...",
                successMessage: "Organisation mise à jour avec succès",
                errorMessage:
                    "Impossible de mettre à jour l'organisation pour le moment",
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
                        Image de profil
                    </p>
                    <div className="flex items-center gap-4">
                        <ImageProfile user={organization} size="2xl" />
                        <div className="flex flex-col text-sm text-muted-foreground">
                            <span>
                                Le téléchargement d&apos;une nouvelle image
                                n&apos;est pas encore disponible.
                            </span>
                            <span>
                                Cette image correspond à celle enregistrée pour
                                votre organisation.
                            </span>
                        </div>
                    </div>
                </section>

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
                                    disabled={form.formState.isSubmitting}
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
                    <FormButton
                        type="submit"
                        loading={form.formState.isSubmitting}
                    >
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
