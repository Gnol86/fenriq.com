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
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import FormButton from "@/components/ui/form-button";

const formSchema = z.object({
    email: z.email("Veuillez entrer une adresse email valide"),
    password: z
        .string("Veuillez entrer un mot de passe valide")
        .min(1, "Le mot de passe est requis"),
});

export default function FormSignin() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: email || "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await authClient.signIn.email(
                {
                    email: values.email,
                    password: values.password,
                    callbackURL: "/app",
                },
                {
                    onSuccess: () => {
                        toast.success("Connexion réussie");
                    },
                    onError: (ctx) => {
                        if (ctx.error.status === 403) {
                            // Rediriger vers la page de vérification avec l'email
                            toast.error(
                                "Votre adresse email n'est pas vérifiée."
                            );
                            router.push(
                                `/verify-email?email=${encodeURIComponent(values.email)}`
                            );
                        } else {
                            toast.error(
                                ctx.error.message || "Échec de la connexion"
                            );
                        }
                    },
                }
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Échec de la connexion. Veuillez réessayer.");
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
                                    disabled={form.formState.isSubmitting}
                                    type="email"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    disabled={form.formState.isSubmitting}
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
                        Se connecter
                    </FormButton>
                    <Link href="/">
                        <Button variant="ghost">Annuler</Button>
                    </Link>
                </div>
                <div className="text-xs flex gap-2 justify-center items-center">
                    Vous n'avez pas de compte ?
                    <Link
                        href={
                            form.watch("email")
                                ? "/signup?email=" + form.watch("email")
                                : "/signup"
                        }
                        className="text-primary hover:underline"
                    >
                        S'inscrire
                    </Link>
                </div>
            </form>
        </Form>
    );
}
