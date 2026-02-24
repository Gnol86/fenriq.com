import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access-control";

export default async function AdminPage() {
    await requireAdmin();
    redirect("/dashboard/admin/users");
}
