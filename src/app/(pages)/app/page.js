import { requireOrganization } from "@/lib/auth-access";

export default async function AppPage() {
    await requireOrganization();
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Application</h1>
        </div>
    );
}
