import { Button } from "../ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function GoAppButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (!user) {
        return null;
    }

    return (
        <Link href="/app">
            <Button>Application</Button>
        </Link>
    );
}
