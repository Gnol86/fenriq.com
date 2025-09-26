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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOrganizationAction } from "@/actions/organization.action";
import { useServerAction } from "@/hooks/use-server-action";
import { TriangleAlert } from "lucide-react";

export default function DangerZoneForm({ organization }) {
    const formSchema = z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, "Vous devez saisir le nom de l'organisation pour confirmer")
            .refine(value => value === organization.name, {
                message:
                    "Le nom saisi ne correspond pas à l'organisation active.",
            }),
    });
    const { execute, isPending } = useServerAction();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            confirmation: "",
        },
    });

    const onSubmit = async () => {
        // Empêcher la soumission automatique du formulaire
        return false; // Ne pas soumettre le formulaire
    };

    const handleDeleteConfirmation = async () => {
        await execute(
            () =>
                deleteOrganizationAction({
                    organizationId: organization.id,
                }),
            {
                successMessage: "Organisation supprimée avec succès",
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
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="font-medium">
                        Cette action est définitive et supprimera toutes les
                        données de l'organisation "{organization.name}".
                    </p>
                    <p className="text-destructive/70">
                        Assurez-vous d'avoir exporté toutes les informations
                        nécessaires avant de continuer.
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Confirmez le nom de l'organisation
                            </FormLabel>
                            <FormDescription>
                                Tapez "{organization.name}" pour valider la
                                suppression.
                            </FormDescription>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    placeholder={organization.name}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.formState.isValid && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <FormButton
                                type="button"
                                variant="destructive"
                                loading={isPending}
                                disabled={!form.formState.isValid}
                            >
                                <TriangleAlert /> Supprimer l'organisation
                                <TriangleAlert />
                            </FormButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Êtes-vous absolument sûr ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela
                                    supprimera définitivement l'organisation "
                                    {organization.name}" et toutes ses données
                                    associées.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteConfirmation}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Supprimer définitivement
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </form>
        </Form>
    );
}
