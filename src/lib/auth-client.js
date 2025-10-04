// src/lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { getServerUrl } from "./server-url";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: getServerUrl(),
    plugins: [adminClient()],
});

export const { useSession, signOut } = authClient;
