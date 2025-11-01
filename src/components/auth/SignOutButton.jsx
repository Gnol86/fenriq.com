import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { signOutAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function SignOutButton() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;

    if (!user) {
        return null;
    }

    const t = await getTranslations("auth.buttons");

    return (
        <form action={signOutAction}>
            <Button type="submit" variant="outline">
                {t("sign_out")}
            </Button>
        </form>
    );
}
