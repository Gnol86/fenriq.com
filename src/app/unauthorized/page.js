import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OctagonX } from "lucide-react";

export default function Unauthorized() {
    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <OctagonX size={48} className="text-destructive" />
            <div className="font-bold">
                Vous n'êtes pas autorisé à accéder à cette page.
            </div>
            <Link href="/">
                <Button>Retour à l'accueil</Button>
            </Link>
        </main>
    );
}
