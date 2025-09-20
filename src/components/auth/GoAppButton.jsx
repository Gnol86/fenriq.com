import { getCurrentUser } from "@/lib/auth-access";
import { Button } from "../ui/button";
import Link from "next/link";

export default async function GoAppButton() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <Link href="/app">
            <Button>Application</Button>
        </Link>
    );
}
