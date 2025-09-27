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
import { deleteOrganizationAction } from "@/actions/admin.action";
import { useServerAction } from "@/hooks/use-server-action";
import { TriangleAlert, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDangerZoneForm({ organization }) {
    const router = useRouter();
    const formSchema = z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, "Vous devez saisir le nom de l'organisation pour confirmer")
            .refine(value => value === organization.name, {
                message:
                    "Le nom saisi ne correspond pas au nom de l'organisation.",
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
                successMessage: `Organisation "${organization.name}" supprimée avec succès (Admin)`,
                onSuccess: () => {
                    router.push("/dashboard/admin/organizations");
                },
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
                    <div className="flex items-center gap-2 font-medium mb-2">
                        <Shield className="h-4 w-4" />
                        Action Administrateur
                    </div>
                    <p className="font-medium">
                        Cette action supprimera définitivement l'organisation "{organization.name}"
                        et toutes ses données associées.
                    </p>
                    <p className="text-destructive/70 mt-1">
                        En tant qu'administrateur, vous avez les droits pour effectuer cette action.
                        Assurez-vous que la suppression est nécessaire.
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="text-sm">
                        <strong>Informations de l'organisation :</strong>
                        <div className="mt-1 space-y-1 text-muted-foreground">
                            <div>• Nom : {organization.name}</div>
                            <div>• Slug : {organization.slug}</div>
                            <div>• ID : {organization.id}</div>
                            <div>• Membres : {organization.members?.length || 0}</div>
                            <div>• Créée le : {new Date(organization.createdAt).toLocaleDateString('fr-FR')}</div>
                        </div>
                    </div>
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
                                Tapez exactement "{organization.name}" pour confirmer la suppression.
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
                                <TriangleAlert /> Supprimer l'organisation (Admin)
                                <TriangleAlert />
                            </FormButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-destructive" />
                                    Confirmation Administrateur
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    <strong>Vous êtes sur le point de supprimer définitivement l'organisation
                                    "{organization.name}"</strong>
                                    <br /><br />
                                    Cette action :
                                    <ul className="mt-2 space-y-1 text-sm">
                                        <li>• Supprimera toutes les données de l'organisation</li>
                                        <li>• Révoquera l'accès de tous les membres</li>
                                        <li>• Annulera toutes les invitations en cours</li>
                                        <li>• Ne pourra pas être annulée</li>
                                    </ul>
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