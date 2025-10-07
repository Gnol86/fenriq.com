"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerUrl } from "@/lib/server-url";

export async function createCheckoutSessionAction({
    priceId,
    organizationId,
    quantity,
    successUrl,
    cancelUrl,
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const baseUrl = getServerUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: quantity ?? 1,
            },
        ],
        success_url: successUrl ?? `${baseUrl}/dashboard`,
        cancel_url: cancelUrl ?? `${baseUrl}/dashboard`,
        metadata: {
            userId: session.user.id,
            organizationId: organizationId ?? "",
        },

        billing_address_collection: "required",
        tax_id_collection: {
            enabled: true,
        },
    });

    return { url: checkoutSession.url };
}

export async function createPortalSessionAction({ customerId, returnUrl }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const baseUrl = getServerUrl();
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl ?? `${baseUrl}/dashboard`,
    });

    return { url: portalSession.url };
}

export async function getSubscriptionAction({ subscriptionId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return subscription;
}

export async function cancelSubscriptionAction({ subscriptionId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return subscription;
}
