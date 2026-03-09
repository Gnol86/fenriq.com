"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { inviteMemberAction } from "@/actions/organization.action";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServerAction } from "@/hooks/use-server-action";

export default function InviteMemberDialog({ organizationId, organizationName }) {
    const t = useTranslations("organization.invitations");
    const tValidation = useTranslations("validation");
    const tRoles = useTranslations("roles");
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const emailInputRef = useRef(null);

    const inviteSchema = z.object({
        email: z.email(tValidation("email.invalid_short")).trim(),
        role: z.enum(["member", "admin"], {
            required_error: tValidation("role.required"),
        }),
    });

    const form = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: "", role: "member" },
    });

    useEffect(() => {
        if (!open) return;

        emailInputRef.current?.focus();
    }, [open]);

    const onInvite = async values => {
        await execute(
            () =>
                inviteMemberAction({
                    email: values.email,
                    role: values.role,
                    organizationId,
                }),
            {
                successMessage: t("success_sent"),
                redirectOnSuccess: "/dashboard/org/invitations",
            }
        );

        form.reset({ email: "", role: "member" });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger nativeButton render={<Button type="button" size="sm" />}>
                <MailPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("invite_button")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("invite_dialog_title")}</DialogTitle>
                    <DialogDescription>
                        {t("invite_dialog_description", {
                            name: organizationName ?? "",
                        })}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onInvite)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("email_label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder={t("email_placeholder")}
                                            ref={node => {
                                                field.ref(node);
                                                emailInputRef.current = node;
                                            }}
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
                                    <FormLabel>{t("role_label")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("role_placeholder")}>
                                                    {field.value ? tRoles(field.value) : null}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="member">
                                                {tRoles("member")}
                                            </SelectItem>
                                            <SelectItem value="admin">{tRoles("admin")}</SelectItem>
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
                                {t("cancel_button")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {t("send_button")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
