"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .min(1, "Vous devez saisir le nom de l'organisation pour confirmer"),
});

export default function DangerZoneForm() {
  const router = useRouter();
  const {
    data: activeOrganization,
    isPending: isLoadingActiveOrganization,
    refetch: refetchActiveOrganization,
  } = authClient.useActiveOrganization();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  useEffect(() => {
    form.reset({ confirmation: "" });
  }, [activeOrganization?.id, form]);

  const onSubmit = async (values) => {
    if (!activeOrganization?.id || !activeOrganization?.name) {
      toast.error(
        "Aucune organisation active n'a été trouvée. Veuillez en sélectionner une.",
      );
      return;
    }

    if (values.confirmation !== activeOrganization.name) {
      form.setError("confirmation", {
        type: "validate",
        message: "Le nom saisi ne correspond pas à l'organisation active.",
      });
      return;
    }

    try {
      const result = await authClient.organization.delete({
        organizationId: activeOrganization.id,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Organisation supprimée avec succès");
      refetchActiveOrganization();
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

  if (isLoadingActiveOrganization) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Chargement de l'organisation...
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>Aucune organisation active n'a été trouvée.</p>
        <p>
          Sélectionnez une organisation dans le menu latéral pour accéder à
          cette section.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">
            Cette action est définitive et supprimera toutes les données de
            l'organisation "{activeOrganization.name}".
          </p>
          <p className="text-destructive/70">
            Assurez-vous d'avoir exporté toutes les informations nécessaires
            avant de continuer.
          </p>
        </div>

        <FormField
          control={form.control}
          name="confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmez le nom de l'organisation</FormLabel>
              <FormDescription>
                Tapez "{activeOrganization.name}" pour valider la suppression.
              </FormDescription>
              <FormControl>
                <Input
                  {...field}
                  autoFocus
                  placeholder={activeOrganization.name}
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
  );
}
