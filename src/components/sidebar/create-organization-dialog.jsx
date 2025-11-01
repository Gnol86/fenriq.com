"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOrganizationAction } from "@/actions/organization.action";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { useServerAction } from "@/hooks/use-server-action";

export default function CreateOrganizationDialog() {
    const t = useTranslations("organization.create_dialog");
    const tValidation = useTranslations("validation.organization_name");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);

    const formSchema = z.object({
        name: z
            .string()
            .trim()
            .regex(/^[\p{L}\p{N} -]+$/u, tValidation("pattern"))
            .min(2, tValidation("min_length"))
            .max(80, tValidation("max_length"))
            .refine(value => {
                const alphanumericMatches = value.match(/\p{L}|\p{N}/gu) ?? [];
                return alphanumericMatches.length >= 2;
            }, tValidation("min_alphanumeric")),
    });

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
                successMessage: t("success_message"),
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
                    {t("trigger_button")}
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
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
                                    <FormLabel>{t("name_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoFocus
                                            placeholder={t("name_placeholder")}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("name_description")}
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
                                {t("cancel_button")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {t("create_button")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
