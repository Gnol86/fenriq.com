"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function createFeedbackAction({ rating, comment, allowUseAsTestimonial = false }) {
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
            allowUseAsTestimonial: rating === 5 && comment?.trim() ? allowUseAsTestimonial : false,
        },
    });

    return feedback;
}

function getFeedbackWhereClause({ searchValue = "", includeResolved = false } = {}) {
    return {
        ...(includeResolved ? {} : { isResolved: false }),
        ...(searchValue
            ? {
                  OR: [
                      {
                          userName: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          userEmail: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                      {
                          comment: {
                              contains: searchValue,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),
    };
}

function revalidateFeedbacksPath() {
    revalidatePath("/dashboard/admin/feedbacks");
}

export async function getAllFeedbacksAction({
    searchValue = "",
    includeResolved = false,
    limit = 10,
    offset = 0,
} = {}) {
    await requireAdmin();

    const whereClause = getFeedbackWhereClause({ searchValue, includeResolved });

    const [feedbacks, total] = await Promise.all([
        prisma.feedback.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
            skip: offset,
            take: limit,
        }),
        prisma.feedback.count({
            where: whereClause,
        }),
    ]);

    return {
        feedbacks,
        total,
    };
}

export async function markFeedbackAsReadAction({ feedbackId }) {
    await requireAdmin();

    const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isRead: true },
    });

    revalidateFeedbacksPath();
    return feedback;
}

export async function markFeedbackAsResolvedAction({ feedbackId }) {
    await requireAdmin();

    const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isResolved: true, isRead: true },
    });

    revalidateFeedbacksPath();
    return feedback;
}

export async function deleteFeedbackAction({ feedbackId }) {
    await requireAdmin();

    await prisma.feedback.delete({
        where: { id: feedbackId },
    });

    revalidateFeedbacksPath();
    return { success: true };
}
