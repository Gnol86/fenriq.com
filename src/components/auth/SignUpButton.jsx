import { getCurrentUser } from "@/lib/data-access";
import Link from "next/link";
import { Button } from "../ui/button";

export default async function SignUpButton() {
    const user = await getCurrentUser();

    if (user) {
        return null;
    }

    return (
        <Link href="/signup">
            <Button variant="outline">S'inscrire</Button>
        </Link>
    );
}
