"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const formSchema = z.object({
    name: z
        .string()
        .trim()
        .regex(
            /^[A-Za-z0-9 -]+$/,
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
    const router = useRouter();
    const organizationName = organization?.name ?? "";
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: organizationName,
        },
    });

    const onSubmit = async values => {
        if (!organization?.id) {
            toast.error(
                "Aucune organisation active n\'a été trouvée. Veuillez en sélectionner une."
            );
            return;
        }

        try {
            // const result = await updateOrganizationAction({
            //     organizationId: organization.id,
            //     name: values.name,
            // });

            // if (!result?.success) {
            //     throw new Error(
            //         result?.error ||
            //             "Impossible de mettre à jour l\'organisation pour le moment"
            //     );
            // }

            toast.success("Organisation mise à jour avec succès");
            router.refresh();
        } catch (error) {
            console.error("Failed to update organization", error);
            const message =
                error?.message ||
                "Impossible de mettre à jour l\'organisation pour le moment";
            toast.error(message);
        }
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
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-muted text-lg">
                                {getInitials(organizationName)}
                            </AvatarFallback>
                            <AvatarImage
                                src={organization?.image ?? undefined}
                                alt={`Avatar de ${organizationName}`}
                            />
                        </Avatar>
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
