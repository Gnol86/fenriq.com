"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Error({ error, reset }) {
    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <div className="flex gap-2 justify-center items-center">
                <div className="text-2xl font-bold">500</div>
                <div className="text-sm">
                    Une erreur s&apos;est produite lors du traitement de votre
                    demande.
                </div>
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
                            navigator.clipboard.writeText(error.message);
                            toast.success("Copié dans le presse-papier");
                        }}
                    >
                        <Copy />
                    </Button>
                    <AlertTriangle />
                    <AlertTitle>{error.name}</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}
        </main>
    );
}
