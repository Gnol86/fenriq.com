"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formSchema = z.object({
    name: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(80, "Le nom ne peut pas dépasser 80 caractères"),
    slug: z
        .string()
        .min(2, "Le slug doit contenir au moins 2 caractères")
        .max(80, "Le slug ne peut pas dépasser 80 caractères")
        .regex(slugRegex, {
            message:
                "Utilisez seulement des lettres minuscules, chiffres et tirets",
        }),
});

const toSlug = (value) => {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
};

export default function NewOrganizationForm() {
    const router = useRouter();
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    const nameValue = form.watch("name");

    useEffect(() => {
        if (slugManuallyEdited) {
            return;
        }
        const nextSlug = toSlug(nameValue || "");
        form.setValue("slug", nextSlug, {
            shouldValidate: true,
            shouldDirty: !!nextSlug,
        });
    }, [form, nameValue, slugManuallyEdited]);

    const onSubmit = async (values) => {
        try {
            const result = await authClient.organization.create({
                name: values.name,
                slug: values.slug,
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
                                    placeholder="Ex. Direction Centrale"
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

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="direction-centrale"
                                    onChange={(event) => {
                                        setSlugManuallyEdited(true);
                                        field.onChange(event);
                                    }}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormDescription>
                                Utilisé dans l'URL de l'organisation.
                            </FormDescription>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                        const generated = toSlug(
                                            form.getValues("name") || ""
                                        );
                                        form.setValue("slug", generated, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                        setSlugManuallyEdited(false);
                                    }}
                                    disabled={
                                        form.formState.isSubmitting || !nameValue
                                    }
                                >
                                    Générer depuis le nom
                                </Button>
                            </div>
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
