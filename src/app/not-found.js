import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-dvh p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-4 justify-center items-center min-h-dvh">
                <div className="flex gap-[32px] justify-center items-center">
                    <div className="text-2xl font-bold">404</div>
                    <div className="text-sm">
                        La page que vous recherchez n'existe pas.
                    </div>
                </div>
                <Link href="/">
                    <Button variant="outline">Retour</Button>
                </Link>
            </main>
        </div>
    );
}
