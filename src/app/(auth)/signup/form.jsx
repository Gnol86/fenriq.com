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
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import FormButton from "@/components/ui/form-button";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z.email("Veuillez entrer une adresse email valide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /(?=.*[a-z])/,
        "Le mot de passe doit contenir au moins une minuscule",
      )
      .regex(
        /(?=.*[A-Z])/,
        "Le mot de passe doit contenir au moins une majuscule",
      )
      .regex(/(?=.*\d)/, "Le mot de passe doit contenir au moins un chiffre"),
    password_confirm: z
      .string()
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

export default function FormSignup() {
  const router = useRouter();
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
          callbackURL: "/email-verified",
        },
        {
          onSuccess: () => {
            toast.success(
              "Compte créé avec succès. Un email de vérification a été envoyé.",
            );
            router.push("/verify-email?email=" + values.email);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Échec de l'envoi du formulaire");
          },
        },
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
                <Input
                  disabled={form.formState.isSubmitting}
                  type="text"
                  {...field}
                />
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
                <PasswordStrengthInput
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
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
            S'inscrire
          </FormButton>
          <Link href="/">
            <Button variant="ghost">Annuler</Button>
          </Link>
        </div>
        <div className="text-xs flex gap-2 justify-center items-center">
          Vous avez déjà un compte ?
          <Link
            href={
              form.watch("email")
                ? "/signin?email=" + form.watch("email")
                : "/signin"
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
