"use client";

import { AlertTriangle, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function extractErrorInfo(error) {
    console.error("Error object:", error);

    // Better-Auth APIError has a specific structure
    if (error.statusCode && error.status) {
        return {
            statusCode: error.statusCode,
            status: error.status,
            message: error.body?.message ?? error.message ?? "Une erreur s'est produite",
            name: error.name ?? "APIError",
        };
    }

    // Handle other error types
    return {
        statusCode: error.statusCode ?? 500,
        status: error.status ?? "INTERNAL_SERVER_ERROR",
        message: error.message ?? "Une erreur s'est produite",
        name: error.name ?? "Error",
    };
}

function getStatusMessage(_status, statusCode) {
    switch (statusCode) {
        case "UNAUTHORIZED":
            return "Vous n'êtes pas autorisé à accéder à cette ressource.";
        case "FORBIDDEN":
            return "Accès interdit.";
        case "NOT_FOUND":
            return "La ressource demandée n'a pas été trouvée.";
        case "BAD_REQUEST":
            return "La requête est invalide.";
        default:
            return "Une erreur s'est produite lors du traitement de votre demande.";
    }
}

export default function GlobalErrorPage({ error, reset }) {
    const errorInfo = extractErrorInfo(error);
    const statusMessage = getStatusMessage(errorInfo.status, errorInfo.statusCode);
    const showDebugDetails = process.env.NODE_ENV === "development";

    return (
        <main className="flex h-dvh w-full flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-bold">{errorInfo.statusCode}</div>
                <div className="text-sm">{statusMessage}</div>
            </div>
            <div className="flex gap-4">
                <Button variant="" onClick={() => reset()}>
                    Réessayer
                </Button>
                <Link href="/">
                    <Button variant="outline">Retour à l&apos;accueil</Button>
                </Link>
            </div>
            {showDebugDetails && (
                <Alert variant="destructive" className={"w-md"}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground absolute top-0 right-0"
                        onClick={() => {
                            navigator.clipboard.writeText(errorInfo.message);
                            toast.success("Copié dans le presse-papier");
                        }}
                    >
                        <Copy />
                    </Button>
                    <AlertTriangle />
                    <AlertTitle>{errorInfo.name}</AlertTitle>
                    <AlertDescription>{errorInfo.message}</AlertDescription>
                </Alert>
            )}
        </main>
    );
}
