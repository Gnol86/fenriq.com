"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function createFeedbackAction({
    rating,
    comment,
    allowUseAsTestimonial = false,
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const feedback = await prisma.feedback.create({
        data: {
            rating,
            comment: comment ?? null,
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
            allowUseAsTestimonial:
                rating === 5 && comment?.trim() ? allowUseAsTestimonial : false,
        },
    });

    return feedback;
}

export async function getAllFeedbacksAction() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized - Admin access required");
    }

    const feedbacks = await prisma.feedback.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return feedbacks;
}

export async function markFeedbackAsReadAction({ feedbackId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized - Admin access required");
    }

    const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isRead: true },
    });

    revalidatePath("/admin/feedbacks");
    return feedback;
}

export async function markFeedbackAsResolvedAction({ feedbackId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized - Admin access required");
    }

    const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isResolved: true, isRead: true },
    });

    revalidatePath("/admin/feedbacks");
    return feedback;
}

export async function deleteFeedbackAction({ feedbackId }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized - Admin access required");
    }

    await prisma.feedback.delete({
        where: { id: feedbackId },
    });

    revalidatePath("/admin/feedbacks");
    return { success: true };
}
