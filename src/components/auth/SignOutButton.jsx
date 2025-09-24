import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { signOutAction } from "@/actions/auth.action";
import { Button } from "../ui/button";

export default async function SignOutButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (!user) {
        return null;
    }

    return (
        <form action={signOutAction}>
            <Button type="submit" variant="outline">
                Se déconnecter
            </Button>
        </form>
    );
}
