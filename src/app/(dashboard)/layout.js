import { needUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
    const user = await needUser();

    return (
        <div className="min-h-dvh">
            <header className="border-b bg-background">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">PolGPT</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
    );
}
