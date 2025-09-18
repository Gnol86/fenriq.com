import Link from "next/link";

export default function AppPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Application</h1>
                <p className="text-muted-foreground">
                    Interface principale de PolGPT
                </p>
            </div>
            
            <div className="flex flex-col gap-4">
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Chat PolGPT</h2>
                    <p className="text-muted-foreground mb-4">
                        Commencez une nouvelle conversation avec PolGPT
                    </p>
                    <div className="flex gap-2">
                        <Link 
                            href="/dashboard" 
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Voir le dashboard
                        </Link>
                        <Link 
                            href="/" 
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
