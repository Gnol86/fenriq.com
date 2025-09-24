import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "../ui/button";

export default async function SignUpButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (user) {
        return null;
    }

    return (
        <Link href="/signup">
            <Button variant="outline">S'inscrire</Button>
        </Link>
    );
}
