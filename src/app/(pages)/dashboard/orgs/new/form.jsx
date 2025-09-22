"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { createOrganizationAction } from "@/actions/organisations.action";
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

export default function NewOrganizationForm() {
    const { execute } = useServerAction();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async values => {
        await execute(
            () =>
                createOrganizationAction({
                    name: values.name,
                }),
            {
                loadingMessage: "Création de l'organisation...",
                successMessage: "Organisation créée avec succès",
                errorMessage:
                    "Impossible de créer l'organisation pour le moment",
                redirectOnSuccess: "/dashboard",
            }
        );
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
