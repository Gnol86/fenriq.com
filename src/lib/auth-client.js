import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
    baseURL: getServerUrl(),
    plugins: [adminClient(), organizationClient()],
});

export const { useSession, signOut } = authClient;
