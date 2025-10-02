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
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function AdminDangerZoneForm({ organization }) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();
    const tDangerZone = useTranslations("admin.org_danger_zone");
    const locale = useLocale();

    const formSchema = useMemo(
        () =>
            z.object({
                confirmation: z
                    .string()
                    .trim()
                    .min(1, tDangerZone("validation_required"))
                    .refine(value => value === organization.name, {
                        message: tDangerZone("validation_mismatch"),
                    }),
            }),
        [organization.name, tDangerZone]
    );

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
                successMessage: tDangerZone("success_message", {
                    name: organization.name,
                }),
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
                        {tDangerZone("admin_banner_title")}
                    </div>
                    <p className="font-medium">
                        {tDangerZone("admin_banner_description", {
                            name: organization.name,
                        })}
                    </p>
                    <p className="text-destructive/70 mt-1">
                        {tDangerZone("admin_banner_note")}
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="text-sm">
                        <strong>{tDangerZone("info_title")}</strong>
                        <div className="mt-1 space-y-1 text-muted-foreground">
                            <div>
                                {tDangerZone("info_name", {
                                    name: organization.name,
                                })}
                            </div>
                            <div>
                                {tDangerZone("info_slug", {
                                    slug: organization.slug,
                                })}
                            </div>
                            <div>
                                {tDangerZone("info_id", {
                                    id: organization.id,
                                })}
                            </div>
                            <div>
                                {tDangerZone("info_members", {
                                    count: organization.members?.length || 0,
                                })}
                            </div>
                            <div>
                                {tDangerZone("info_created", {
                                    date: new Intl.DateTimeFormat(locale, {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    }).format(new Date(organization.createdAt)),
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {tDangerZone("confirm_label")}
                            </FormLabel>
                            <FormDescription>
                                {tDangerZone("confirm_description", {
                                    name: organization.name,
                                })}
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
                                <TriangleAlert /> {tDangerZone("trigger_label")}
                                <TriangleAlert />
                            </FormButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-destructive" />
                                    {tDangerZone("alert_title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    <strong>
                                        {tDangerZone("alert_intro", {
                                            name: organization.name,
                                        })}
                                    </strong>
                                    <ul className="mt-4 space-y-1 text-sm">
                                        <li>{tDangerZone("alert_consequence_1")}</li>
                                        <li>{tDangerZone("alert_consequence_2")}</li>
                                        <li>{tDangerZone("alert_consequence_3")}</li>
                                        <li>{tDangerZone("alert_consequence_4")}</li>
                                    </ul>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {tDangerZone("alert_cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteConfirmation}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {tDangerZone("alert_confirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </form>
        </Form>
    );
}
