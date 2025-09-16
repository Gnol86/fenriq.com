"use client";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";

export default function SignUpButton() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (session?.user) {
        return null;
    }

    if (pathname.includes("/auth/signup")) {
        return null;
    }

    return (
        <Link href="/auth/signup">
            <Button variant="outline">S'inscrire</Button>
        </Link>
    );
}
