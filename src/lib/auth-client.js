// src/lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
    baseURL: getServerUrl(),
});

export const { useSession, signOut } = authClient;
