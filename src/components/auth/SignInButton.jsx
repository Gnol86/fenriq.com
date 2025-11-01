import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function SignInButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (user) {
        return null;
    }

    const t = await getTranslations("auth.buttons");

    return (
        <Link href="/signin">
            <Button>{t("sign_in")}</Button>
        </Link>
    );
}
