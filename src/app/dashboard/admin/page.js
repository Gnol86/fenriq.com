import { requireAdmin } from "@root/src/lib/access-control";
import { redirect } from "next/navigation";

export default function Page() {
    requireAdmin();
    redirect("/dashboard");
}
