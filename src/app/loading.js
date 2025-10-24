import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <main className="flex h-dvh w-full flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" />
                <div className="text-sm">Chargement en cours...</div>
            </div>
        </main>
    );
}
