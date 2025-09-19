import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <div className="flex gap-2 justify-center items-center">
                <div className="text-2xl font-bold">404</div>
                <div className="text-sm">
                    La page que vous recherchez n&apos;existe pas.
                </div>
            </div>
            <Link href="/">
                <Button>Retour à l&apos;accueil</Button>
            </Link>
        </main>
    );
}
