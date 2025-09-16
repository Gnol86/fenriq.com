export default function Loading() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-dvh p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-4 justify-center items-center min-h-dvh">
                <div className="flex gap-[32px] justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                    <div className="text-sm">
                        Chargement en cours...
                    </div>
                </div>
            </main>
        </div>
    );
}