import { getUser } from "@/lib/auth";
import { signOutAction } from "@/actions/auth.action";
import { Button } from "../ui/button";

export default async function SignOutButton() {
    const user = await getUser();

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
