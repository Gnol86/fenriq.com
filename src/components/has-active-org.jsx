"use client";

import { authClient } from "@/lib/auth-client";

export default function HasActiveOrg({ children, reverse = false }) {
    const { data: activeOrganization, isPending } =
        authClient.useActiveOrganization();

    if (
        !isPending &&
        (reverse ? !activeOrganization : Boolean(activeOrganization))
    ) {
        return children;
    }
    return null;
}
