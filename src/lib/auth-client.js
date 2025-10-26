// src/lib/auth-client.js
import { stripeClient } from "@better-auth/stripe/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
    baseURL: getServerUrl(),
    plugins: [
        adminClient(),
        stripeClient({
            subscription: true, //if you want to enable subscription management
        }),
    ],
});

export const { useSession, signOut } = authClient;
