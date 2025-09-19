import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <main className="flex flex-col gap-4 items-center justify-center h-dvh">
            <div className="flex gap-2 justify-center items-center">
                <Loader2 className="animate-spin" />
                <div className="text-sm">Chargement en cours...</div>
            </div>
        </main>
    );
}
