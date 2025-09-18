import { getUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "../ui/button";

export default async function SignInButton() {
    const user = await getUser();

    if (user) {
        return null;
    }

    return (
        <Link href="/signin">
            <Button>Se connecter</Button>
        </Link>
    );
}
