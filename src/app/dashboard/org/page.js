import { requireActiveOrganization } from "@root/src/lib/access-control";
import { redirect } from "next/navigation";

export default function Page() {
    requireActiveOrganization();
    redirect("/dashboard");
}
