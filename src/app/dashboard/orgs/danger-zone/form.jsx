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

const formSchema = z.object({
    confirmation: z
        .string()
        .trim()
        .min(1, "Vous devez saisir le nom de l'organisation pour confirmer"),
});

export default function DangerZoneForm({ organization }) {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            confirmation: "",
        },
    });

    const onSubmit = async values => {
        if (!organization?.id || !organization?.name) {
            toast.error(
                "Aucune organisation active n'a été trouvée. Veuillez en sélectionner une."
            );
            return;
        }

        if (values.confirmation !== organization.name) {
            form.setError("confirmation", {
                type: "validate",
                message:
                    "Le nom saisi ne correspond pas à l'organisation active.",
            });
            return;
        }

        try {
            // const result = await deleteOrganizationAction({
            //     organizationId: organization.id,
            // });

            // if (!result?.success) {
            //     throw new Error(
            //         result?.error ||
            //             "Impossible de supprimer l'organisation pour le moment"
            //     );
            // }

            toast.success("Organisation supprimée avec succès");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Failed to delete organization", error);
            const message =
                error?.message ||
                "Impossible de supprimer l'organisation pour le moment";
            toast.error(message);
        }
    };

    return organization ? (
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
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormButton
                    type="submit"
                    loading={form.formState.isSubmitting}
                    variant="destructive"
                    className="self-end"
                >
                    Supprimer l'organisation
                </FormButton>
            </form>
        </Form>
    ) : (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Aucune organisation active n'a été trouvée.</p>
            <p>
                Sélectionnez une organisation dans le menu latéral pour accéder
                à cette section.
            </p>
        </div>
    );
}
