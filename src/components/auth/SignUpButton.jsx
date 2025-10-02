import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function SignUpButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (user) {
        return null;
    }

    const t = await getTranslations("auth.buttons");

    return (
        <Link href="/signup">
            <Button variant="outline">{t("sign_up")}</Button>
        </Link>
    );
}
