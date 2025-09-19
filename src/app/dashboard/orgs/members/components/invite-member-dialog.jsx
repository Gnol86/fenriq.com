"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { inviteMemberAction } from "@/actions/organization.action";

const inviteSchema = z.object({
    email: z
        .string({ required_error: "L'adresse email est requise" })
        .trim()
        .min(1, "L'adresse email est requise")
        .email("Adresse email invalide"),
});

export default function InviteMemberDialog({ organizationId, organizationName }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: "" },
    });

    const onInvite = async values => {
        if (!organizationId) {
            toast.error(
                "Aucune organisation active. Sélectionnez une organisation avant d'inviter."
            );
            return;
        }

        try {
            const response = await inviteMemberAction({
                email: values.email,
                role: "member",
                organizationId,
            });

            if (!response?.success) {
                throw new Error(response?.error);
            }

            toast.success("Invitation envoyée avec succès");
            form.reset({ email: "" });
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to invite member", error);
            toast.error(
                error?.message ||
                    "Impossible d'envoyer l'invitation pour le moment"
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="self-start" size="sm">
                    <MailPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Inviter
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Inviter un membre</DialogTitle>
                    <DialogDescription>
                        Saisissez l&apos;adresse email de la personne à inviter
                        dans l&apos;organisation {organizationName ?? ""}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onInvite)}
                        className="flex flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="prenom.nom@example.com"
                                            autoFocus
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={form.formState.isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                Envoyer l&apos;invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
