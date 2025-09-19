import { requireUser } from "@/lib/data-access";

export default async function DashboardPage() {
    const user = await requireUser();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
                Bienvenue {user?.name ? `${user.name}` : "sur votre espace"}.
            </p>
        </div>
    );
}
