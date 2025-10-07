import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                console.log("Checkout session completed:", session.id);
                break;

            case "customer.subscription.created":
                const subscriptionCreated = event.data.object;
                console.log("Subscription created:", subscriptionCreated.id);
                break;

            case "customer.subscription.updated":
                const subscriptionUpdated = event.data.object;
                console.log("Subscription updated:", subscriptionUpdated.id);
                break;

            case "customer.subscription.deleted":
                const subscriptionDeleted = event.data.object;
                console.log("Subscription deleted:", subscriptionDeleted.id);
                break;

            case "invoice.payment_succeeded":
                const invoice = event.data.object;
                console.log("Invoice payment succeeded:", invoice.id);
                break;

            case "invoice.payment_failed":
                const invoiceFailed = event.data.object;
                console.log("Invoice payment failed:", invoiceFailed.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
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
