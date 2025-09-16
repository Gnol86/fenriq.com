"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const formSchema = z
    .object({
        name: z
            .string("Veuillez entrer un nom valide")
            .min(2, "Le nom doit contenir au moins 2 caractères")
            .max(50, "Le nom ne peut pas dépasser 50 caractères"),
        email: z.email("Veuillez entrer une adresse email valide").refine(
            (email) => {
                if (process.env.VERCEL_ENV === "production") {
                    return (
                        email.endsWith("@police.belgium.eu") ||
                        email === "arnaud.marchot@icloud.com"
                    );
                }
                return true;
            },
            {
                message: "L'email doit être une adresse @police.belgium.eu",
            }
        ),
        password: z
            .string("Veuillez entrer un mot de passe valide")
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(
                /(?=.*[a-z])/,
                "Le mot de passe doit contenir au moins une minuscule"
            )
            .regex(
                /(?=.*[A-Z])/,
                "Le mot de passe doit contenir au moins une majuscule"
            )
            .regex(
                /(?=.*\d)/,
                "Le mot de passe doit contenir au moins un chiffre"
            ),
        password_confirm: z
            .string("Veuillez confirmer votre mot de passe")
            .min(1, "Veuillez confirmer votre mot de passe"),
    })
    .refine((data) => data.password === data.password_confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["password_confirm"],
    });

export default function FormSignup() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: email || "",
            password: "",
            password_confirm: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await authClient.signUp.email(
                {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    callbackURL: "/",
                },
                {
                    onSuccess: (ctx) => {
                        toast.success("Compte créé avec succès");
                    },
                    onError: (ctx) => {
                        toast.error(
                            ctx.error.message ||
                                "Échec de l'envoi du formulaire"
                        );
                    },
                }
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Échec de l'envoi du formulaire. Veuillez réessayer.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input placeholder="" type="text" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="" type="email" {...field} />
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
                                <PasswordInput placeholder="" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password_confirm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder="" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                        S'inscrire
                    </Button>
                    <Link href="/">
                        <Button variant="ghost">Annuler</Button>
                    </Link>
                </div>
                <div className="text-xs flex gap-2 justify-center items-center">
                    Vous avez déjà un compte ?
                    <Link
                        href={
                            form.watch("email")
                                ? "/auth/signin?email=" + form.watch("email")
                                : "/auth/signin"
                        }
                        className="text-primary hover:underline"
                    >
                        Se connecter
                    </Link>
                </div>
            </form>
        </Form>
    );
}
