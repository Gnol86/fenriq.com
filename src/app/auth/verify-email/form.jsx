"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import FormButton from "@/components/ui/form-button";

const formSchema = z.object({
    email: z.email("Veuillez entrer une adresse email valide"),
});

export default function FormResendVerification() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: email || "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await authClient.sendVerificationEmail({
                email: values.email,
                callbackURL: "/auth/email-verified",
            });

            toast.success(
                "Email de vérification envoyé ! Vérifiez votre boîte email."
            );
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            toast.error(
                "Erreur lors de l'envoi de l'email. Veuillez réessayer."
            );
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={true}
                                    type="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2">
                    <FormButton
                        type="submit"
                        loading={form.formState.isSubmitting}
                        className="flex-1"
                    >
                        Renvoyer l'email
                    </FormButton>
                    <Link href="/auth/signin">
                        <Button variant="ghost">Retour</Button>
                    </Link>
                </div>

                <div className="text-xs flex gap-2 justify-center items-center">
                    Déjà vérifié ?
                    <Link
                        href="/auth/signin"
                        className="text-primary hover:underline"
                    >
                        Se connecter
                    </Link>
                </div>
            </form>
        </Form>
    );
}
