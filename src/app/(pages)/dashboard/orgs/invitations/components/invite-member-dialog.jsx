"use client";

import { useState } from "react";
import { Loader2, MailPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { defaultRoleLabels } from "@/lib/constants";
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
    email: z.email("Adresse email invalide").trim(),
    role: z.enum(["member", "admin"], {
        required_error: "Veuillez sélectionner un rôle",
    }),
});

export default function InviteMemberDialog({
    organizationId,
    organizationName,
}) {
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: "", role: "member" },
    });

    const onInvite = async values => {
        await execute(
            () =>
                inviteMemberAction({
                    email: values.email,
                    role: values.role,
                    organizationId,
                }),
            {
                successMessage: "Invitation envoyée avec succès",
                redirectOnSuccess: "/dashboard/orgs/invitations",
            }
        );

        form.reset({ email: "", role: "member" });
        setOpen(false);
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rôle</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un rôle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="member">
                                                {defaultRoleLabels.member}
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                {defaultRoleLabels.admin}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
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
