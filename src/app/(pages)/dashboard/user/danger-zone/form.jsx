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
import { deleteUserAction } from "@/actions/user.action";
import { useServerAction } from "@/hooks/use-server-action";
import { TriangleAlert } from "lucide-react";

export default function DangerZoneForm({ user }) {
    const formSchema = z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, "Vous devez saisir votre adresse email pour confirmer")
            .refine(value => value === user.email, {
                message:
                    "L'adresse email saisie ne correspond pas à votre compte.",
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
        await execute(() => deleteUserAction(), {
            successMessage: "Compte supprimé avec succès",
            redirectOnSuccess: "/",
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="font-medium">
                        Cette action est définitive et supprimera toutes vos
                        données personnelles et votre accès à toutes les
                        organisations.
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
                                Confirmez votre adresse email
                            </FormLabel>
                            <FormDescription>
                                Tapez "{user.email}" pour valider la
                                suppression.
                            </FormDescription>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    placeholder={user.email}
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
                                <TriangleAlert /> Supprimer mon compte
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
                                    supprimera définitivement votre compte et
                                    toutes vos données associées.
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
