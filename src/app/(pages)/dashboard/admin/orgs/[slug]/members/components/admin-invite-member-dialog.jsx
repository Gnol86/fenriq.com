"use client";

import { useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getRoleLabel } from "@/lib/constants";

export default function AdminInviteMemberDialog({
    organizationId,
    organizationName,
}) {
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const tMembers = useTranslations("admin.org_members");
    const tInvitations = useTranslations("organization.invitations");
    const tValidation = useTranslations("validation");
    const tRoles = useTranslations("roles");

    const inviteSchema = useMemo(
        () =>
            z.object({
                email: z
                    .string()
                    .trim()
                    .email(tValidation("email.invalid")),
                role: z.enum(["member", "admin"], {
                    required_error: tValidation("role.required"),
                }),
            }),
        [tValidation]
    );

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
                successMessage: tMembers("invite_success"),
                onSuccess: () => {
                    router.refresh();
                },
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
                    {tMembers("invite_trigger")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{tMembers("invite_title")}</DialogTitle>
                    <DialogDescription>
                        {tMembers("invite_description", {
                            name: organizationName ?? "",
                        })}
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
                                    <FormLabel>
                                        {tInvitations("email_label")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder={tInvitations(
                                                "email_placeholder"
                                            )}
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
                                    <FormLabel>
                                        {tInvitations("role_label")}
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={tMembers(
                                                        "invite_role_placeholder"
                                                    )}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["member", "admin"].map(role => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleLabel(role, tRoles)}
                                                </SelectItem>
                                            ))}
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
                                {tMembers("invite_cancel")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {tMembers("invite_submit")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
