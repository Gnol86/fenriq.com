"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

function extractErrorInfo(error) {
    // L'erreur dans Next.js error.js a une structure différente
    // Elle contient un digest mais les propriétés APIError originales ne sont pas directement accessibles

    let statusCode = 500;
    let status = "INTERNAL_SERVER_ERROR";
    let message = "Une erreur s'est produite";
    let name = error.name || "Error";

    // Essayer d'extraire les informations de l'erreur Better-Auth à partir du message
    if (error.message && error.message.includes("APIError")) {
        // Pattern pour extraire les infos du message d'erreur Better-Auth
        const apiErrorMatch = error.message.match(
            /\[Error \[APIError\]: (.*?)\]/
        );
        if (apiErrorMatch) {
            message = apiErrorMatch[1] || "Erreur d'authentification";
        }

        // Si on a un digest, c'est probablement une erreur d'autorisation
        if (error.digest) {
            statusCode = 401;
            status = "UNAUTHORIZED";
            message = "Vous n'êtes pas autorisé à accéder à cette ressource.";
            name = "APIError";
        }
    } else if (error.message) {
        message = error.message;
    }

    return {
        statusCode,
        status,
        message,
        name,
        digest: error.digest,
    };
}

export default function Error({ error, reset }) {
    const errorInfo = extractErrorInfo(error);

    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <div className="flex gap-2 justify-center items-center">
                <div className="text-2xl font-bold">{errorInfo.statusCode}</div>
                <div className="text-sm">Une erreur s'est produite</div>
            </div>
            <div className="flex gap-4">
                <Button variant="" onClick={() => reset()}>
                    Réessayer
                </Button>
                <Link href="/">
                    <Button variant="outline">Retour à l&apos;accueil</Button>
                </Link>
            </div>
            {process.env.VERCEL_ENV !== "production" && (
                <Alert variant="destructive" className={"w-md"}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground absolute top-0 right-0"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                JSON.stringify(
                                    {
                                        message: error.message,
                                        name: error.name,
                                        digest: error.digest,
                                        stack: error.stack,
                                    },
                                    null,
                                    2
                                )
                            );
                            toast.success("Copié dans le presse-papier");
                        }}
                    >
                        <Copy />
                    </Button>
                    <AlertTriangle />
                    <AlertTitle>{errorInfo.name}</AlertTitle>
                    <AlertDescription>
                        <div>Message: {error.message}</div>
                        {error.digest && <div>Digest: {error.digest}</div>}
                    </AlertDescription>
                </Alert>
            )}
        </main>
    );
}
