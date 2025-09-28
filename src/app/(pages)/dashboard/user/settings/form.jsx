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
import ImageUploadUser from "./image-upload-user";
import { useServerAction } from "@/hooks/use-server-action";
import { updateUserAction } from "@/actions/user.action";

const formSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

export default function UserSettingsForm({ user }) {
    const { execute, isPending } = useServerAction();

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
                successMessage: "Paramètres mis à jour avec succès",
                errorMessage: "Erreur lors de la mise à jour des paramètres",
            }
        );
    };

    return user ? (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <ImageUploadUser user={user} />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    disabled={isPending}
                                    placeholder="Votre nom"
                                />
                            </FormControl>
                            <FormDescription>
                                Ce nom sera affiché dans votre profil.
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
            <p>Impossible de charger les informations utilisateur.</p>
            <p>Veuillez vous reconnecter pour accéder à vos paramètres.</p>
        </div>
    );
}
