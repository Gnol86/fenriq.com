import { requireAuth } from "@root/src/lib/access-control";
import { redirect } from "next/navigation";

export default async function Page() {
    await requireAuth();
    redirect("/dashboard");
}
