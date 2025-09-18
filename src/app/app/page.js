import { needUser } from "@/lib/auth";
import Link from "next/link";

export default async function Page() {
    const user = await needUser();

    return (
        <div className="flex flex-col gap-4 items-center justify-center h-dvh">
            <h1 className="text-2xl font-bold">App</h1>
            <main>
                <Link href="/">Retour à l'accueil</Link>
            </main>
        </div>
    );
}
