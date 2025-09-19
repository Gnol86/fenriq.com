"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormButton from "@/components/ui/form-button";
import { nameToSlug } from "@/lib/utils";

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

export default function NewOrganizationForm() {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async values => {
        try {
            const result = await authClient.organization.create({
                name: values.name,
                slug: nameToSlug(values.name),
            });

            if (result.error) {
                throw result.error;
            }

            const createdOrganizationId = result.data?.id;
            if (createdOrganizationId) {
                try {
                    await authClient.organization.setActive({
                        organizationId: createdOrganizationId,
                    });
                } catch (switchError) {
                    console.error(
                        "Failed to switch to the newly created organization",
                        switchError
                    );
                    toast.error(
                        "Organisation créée, mais le changement automatique a échoué."
                    );
                }
            }

            toast.success("Organisation créée avec succès");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Failed to create organization", error);
            const message =
                error?.message ||
                "Impossible de créer l'organisation pour le moment";
            toast.error(message);
        }
    };

    return (
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
                            <FormLabel>Nom de l'organisation</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    placeholder="Aqme corp"
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

                <FormButton
                    type="submit"
                    loading={form.formState.isSubmitting}
                    className="self-end"
                >
                    Créer l'organisation
                </FormButton>
            </form>
        </Form>
    );
}
