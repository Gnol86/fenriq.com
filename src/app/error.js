"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-dvh p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-4 justify-center items-center min-h-dvh">
                <div className="flex gap-[32px] justify-center items-center">
                    <div className="text-2xl font-bold">500</div>
                    <div className="text-sm">
                        Une erreur s'est produite lors du traitement de votre demande.
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => reset()}>
                        Réessayer
                    </Button>
                    <Link href="/">
                        <Button variant="outline">Retour</Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}