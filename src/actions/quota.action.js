"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/access-control";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { SiteConfig } from "@/site-config";

/**
 * Met à jour la quantité (seats) d'un abonnement existant via Stripe.
 */
export async function updateSubscriptionQuantityAction({ quantity }) {
    const { organization } = await requirePermission({
        permissions: { billing: ["manage"] },
    });

    // Validation
    if (!SiteConfig.quota?.enabled) {
        throw new Error("Quota system is not enabled");
    }
    const { minimum, step } = SiteConfig.quota;
    if (quantity < minimum) {
        throw new Error(`Minimum ${minimum} unités`);
    }
    if (step && step > 1 && quantity % step !== 0) {
        throw new Error(`La quantité doit être un multiple de ${step}`);
    }

    // Récupérer l'abonnement actif
    const subscription = await prisma.subscription.findFirst({
        where: {
            referenceId: organization.id,
            status: { in: ["active", "trialing"] },
        },
    });

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("Aucun abonnement actif");
    }

    // Récupérer le subscription item Stripe
    const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
    );
    const itemId = stripeSub.items.data[0].id;

    // Mettre à jour la quantité sur Stripe (prorata automatique)
    await stripe.subscriptionItems.update(itemId, {
        quantity,
        proration_behavior: "create_prorations",
    });

    // Mettre à jour seats en DB
    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { seats: quantity },
    });

    revalidatePath("/dashboard/org/subscription");
    return { success: true, seats: quantity };
}
