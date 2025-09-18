export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Bienvenue sur votre tableau de bord PolGPT
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold">Statistiques</h3>
                    <p className="text-sm text-muted-foreground">
                        Vos métriques d'utilisation
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold">Historique</h3>
                    <p className="text-sm text-muted-foreground">
                        Vos conversations récentes
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold">Paramètres</h3>
                    <p className="text-sm text-muted-foreground">
                        Configuration de votre compte
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold">Support</h3>
                    <p className="text-sm text-muted-foreground">
                        Aide et documentation
                    </p>
                </div>
            </div>
        </div>
    );
}