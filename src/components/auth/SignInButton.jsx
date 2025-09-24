import Link from "next/link";
import { Button } from "../ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SignInButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (user) {
        return null;
    }

    return (
        <Link href="/signin">
            <Button>Se connecter</Button>
        </Link>
    );
}
