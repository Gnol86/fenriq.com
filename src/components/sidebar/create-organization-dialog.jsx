"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { createOrganizationAction } from "@/actions/organization.action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

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

export default function CreateOrganizationDialog() {
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    const onSubmit = async values => {
        await execute(
            () =>
                createOrganizationAction({
                    name: values.name,
                }),
            {
                successMessage: "Organisation créée avec succès",
                redirectOnSuccess: "/dashboard",
            }
        );

        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={event => {
                        event.preventDefault();
                        setOpen(true);
                    }}
                >
                    <Plus className="" aria-hidden="true" />
                    Créer une organisation
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer une organisation</DialogTitle>
                    <DialogDescription>
                        Donnez un nom à votre organisation pour commencer à
                        collaborer avec votre équipe.
                    </DialogDescription>
                </DialogHeader>
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Ce nom est visible par tous les membres.
                                    </FormDescription>
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
                                Créer l&apos;organisation
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
