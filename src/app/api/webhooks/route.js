import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    upsertSubscriptionFromStripeAction,
    deleteSubscriptionAction,
} from "@/actions/stripe.action";

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;

                // Get organization ID from metadata
                const organizationId = session.metadata?.organizationId;

                if (!organizationId) {
                    console.error("❌ No organizationId in metadata");
                    break;
                }

                if (!session.subscription) {
                    console.error("❌ No subscription in session");
                    break;
                }

                // Fetch the subscription details from Stripe
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription,
                    { expand: ["items.data.price"] }
                );

                // Store subscription in database
                await upsertSubscriptionFromStripeAction({
                    stripeSubscription: subscription,
                    organizationId,
                });

                break;
            }

            case "customer.subscription.created": {
                const subscription = event.data.object;

                // Find organization by customer ID
                const organizationId = subscription.metadata?.organizationId;

                if (organizationId) {
                    await upsertSubscriptionFromStripeAction({
                        stripeSubscription: subscription,
                        organizationId,
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;

                // Find organization by subscription ID
                const { PrismaClient } = await import("@root/prisma/generated");
                const prisma = new PrismaClient();

                const existingSubscription =
                    await prisma.subscription.findFirst({
                        where: {
                            stripeSubscriptionId: subscription.id,
                        },
                    });

                if (existingSubscription) {
                    await upsertSubscriptionFromStripeAction({
                        stripeSubscription: subscription,
                        organizationId: existingSubscription.referenceId,
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;

                // Find and delete subscription from database
                const { PrismaClient } = await import("@root/prisma/generated");
                const prisma = new PrismaClient();

                const existingSubscription =
                    await prisma.subscription.findFirst({
                        where: {
                            stripeSubscriptionId: subscription.id,
                        },
                    });

                if (existingSubscription) {
                    await deleteSubscriptionAction({
                        organizationId: existingSubscription.referenceId,
                    });
                }
                break;
            }

            case "invoice.payment_succeeded": {
                // Could be used to send receipt emails or update payment status
                break;
            }

            case "invoice.payment_failed": {
                // Could be used to notify organization about payment failure
                break;
            }

            default:
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Error processing webhook:", err);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
