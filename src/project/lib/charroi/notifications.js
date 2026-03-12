import { ChecklistDigestEmailTemplate } from "@project/components/email/checklist-digest-email";
import { ChecklistIssueEmailTemplate } from "@project/components/email/checklist-issue-email";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { SiteConfig } from "@/site-config";
import { getTimeZoneMinuteKey, isCronDue } from "./cron";
import { getSubmissionVehicleLabel } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSubmissionUrl(submissionId) {
    return `${getServerUrl()}/dashboard/project/charroi/submissions/${submissionId}`;
}

function formatSubmittedAt(date, timeZone = SiteConfig.timeZone) {
    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
    }).format(date);
}

function getResolvedDeliveryMode(subscription) {
    return subscription.deliveryModeOverride ?? subscription.category.defaultDeliveryMode;
}

async function getOrganizationById(organizationId) {
    return await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });
}

async function getMembersMap(memberIds) {
    const members = await prisma.member.findMany({
        where: {
            id: {
                in: memberIds,
            },
        },
        include: {
            user: true,
        },
    });

    return new Map(members.map(member => [member.id, member]));
}

async function sendImmediateNotificationEmail({
    category,
    issues,
    organizationName,
    recipient,
    submission,
}) {
    const submissionUrl = getSubmissionUrl(submission.id);

    const { data, error } = await resend.emails.send(
        {
            from: SiteConfig.mail.from,
            to: recipient.member.user.email,
            subject: `${SiteConfig.title} - Incident ${category.name} sur ${submission.vehiclePlateNumberSnapshot}`,
            react: ChecklistIssueEmailTemplate({
                categoryName: category.name,
                checklistName: submission.checklistNameSnapshot,
                organizationName,
                submissionUrl,
                submitterName: submission.submitterName,
                submittedAt: formatSubmittedAt(submission.submittedAt),
                vehicleLabel: getSubmissionVehicleLabel(submission),
                issues,
            }),
        },
        {
            idempotencyKey: `checklist-immediate/${submission.id}/${category.id}/${recipient.member.id}`,
        }
    );

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

async function sendDigestNotificationEmail({ category, deliveries, organizationName, recipient }) {
    const { data, error } = await resend.emails.send(
        {
            from: SiteConfig.mail.from,
            to: recipient.member.user.email,
            subject: `${SiteConfig.title} - Digest ${category.name}`,
            react: ChecklistDigestEmailTemplate({
                categoryName: category.name,
                digestLabel: category.defaultDigestCron ?? "planifié",
                deliveries: deliveries.map(delivery => ({
                    ...delivery,
                    submission: {
                        ...delivery.submission,
                        submittedAt: formatSubmittedAt(
                            delivery.submission.submittedAt,
                            category.timeZone
                        ),
                    },
                    submissionUrl: getSubmissionUrl(delivery.submission.id),
                })),
                organizationName,
            }),
        },
        {
            idempotencyKey: `checklist-digest/${category.id}/${recipient.member.id}/${getTimeZoneMinuteKey(new Date(), category.timeZone)}`,
        }
    );

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function dispatchChecklistSubmissionNotifications({ submissionId }) {
    const submission = await prisma.checklistSubmission.findUnique({
        where: {
            id: submissionId,
        },
        include: {
            issues: {
                where: {
                    categoryId: {
                        not: null,
                    },
                },
                include: {
                    category: true,
                },
            },
        },
    });

    if (!submission || submission.issues.length === 0) {
        return {
            digestQueued: 0,
            immediateSent: 0,
        };
    }

    const organization = await getOrganizationById(submission.organizationId);

    const issuesByCategory = submission.issues.reduce((acc, issue) => {
        const categoryId = issue.categoryId;

        if (!categoryId) {
            return acc;
        }

        if (!acc.has(categoryId)) {
            acc.set(categoryId, []);
        }

        acc.get(categoryId).push(issue);
        return acc;
    }, new Map());

    const subscriptions = await prisma.checklistMemberSubscription.findMany({
        where: {
            organizationId: submission.organizationId,
            categoryId: {
                in: [...issuesByCategory.keys()],
            },
            isActive: true,
            category: {
                isActive: true,
            },
        },
        include: {
            category: true,
        },
    });
    const membersMap = await getMembersMap(
        subscriptions.map(subscription => subscription.memberId)
    );

    let immediateSent = 0;
    let digestQueued = 0;

    for (const subscription of subscriptions) {
        const issues = issuesByCategory.get(subscription.categoryId) ?? [];
        const member = membersMap.get(subscription.memberId);

        if (issues.length === 0 || !member?.user?.email) {
            continue;
        }

        const notificationType = getResolvedDeliveryMode(subscription);
        const delivery = await prisma.checklistNotificationDelivery.upsert({
            where: {
                submissionId_categoryId_recipientMemberId_notificationType: {
                    submissionId: submission.id,
                    categoryId: subscription.categoryId,
                    recipientMemberId: subscription.memberId,
                    notificationType,
                },
            },
            create: {
                organizationId: submission.organizationId,
                submissionId: submission.id,
                categoryId: subscription.categoryId,
                recipientMemberId: subscription.memberId,
                recipientEmail: member.user.email,
                notificationType,
                status: "PENDING",
                idempotencyKey: `checklist-${notificationType.toLowerCase()}/${submission.id}/${subscription.categoryId}/${subscription.memberId}`,
            },
            update: {
                recipientEmail: member.user.email,
            },
        });

        if (notificationType === "DIGEST") {
            digestQueued += 1;
            continue;
        }

        if (delivery.status === "SENT") {
            continue;
        }

        try {
            await sendImmediateNotificationEmail({
                category: subscription.category,
                issues,
                organizationName: organization?.name ?? submission.organizationId,
                recipient: {
                    member,
                },
                submission,
            });

            await prisma.checklistNotificationDelivery.update({
                where: {
                    id: delivery.id,
                },
                data: {
                    status: "SENT",
                    sentAt: new Date(),
                    errorMessage: null,
                },
            });
            immediateSent += 1;
        } catch (error) {
            await prisma.checklistNotificationDelivery.update({
                where: {
                    id: delivery.id,
                },
                data: {
                    status: "FAILED",
                    errorMessage: error?.message ?? "Unknown error",
                },
            });
        }
    }

    return {
        digestQueued,
        immediateSent,
    };
}

export async function runChecklistDigestDispatch({ now = new Date() } = {}) {
    const categories = await prisma.checklistCategory.findMany({
        where: {
            isActive: true,
            defaultDigestCron: {
                not: null,
            },
            notifications: {
                some: {
                    notificationType: "DIGEST",
                    status: {
                        in: ["PENDING", "FAILED"],
                    },
                },
            },
        },
        include: {},
    });

    let processedCategories = 0;
    let sentDigests = 0;

    for (const category of categories) {
        const timeZone = category.timeZone || SiteConfig.timeZone;
        const nowKey = getTimeZoneMinuteKey(now, timeZone);
        const lastRunKey = category.lastDigestRunAt
            ? getTimeZoneMinuteKey(category.lastDigestRunAt, timeZone)
            : null;

        if (
            !category.defaultDigestCron ||
            !isCronDue(now, category.defaultDigestCron, timeZone) ||
            nowKey === lastRunKey
        ) {
            continue;
        }

        const deliveries = await prisma.checklistNotificationDelivery.findMany({
            where: {
                categoryId: category.id,
                notificationType: "DIGEST",
                status: {
                    in: ["PENDING", "FAILED"],
                },
            },
            include: {
                submission: {
                    include: {
                        issues: {
                            where: {
                                categoryId: category.id,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (deliveries.length === 0) {
            continue;
        }

        const organization = await getOrganizationById(category.organizationId);
        const membersMap = await getMembersMap([
            ...new Set(deliveries.map(delivery => delivery.recipientMemberId)),
        ]);

        const deliveriesByMember = deliveries.reduce((acc, delivery) => {
            if (!acc.has(delivery.recipientMemberId)) {
                acc.set(delivery.recipientMemberId, []);
            }

            acc.get(delivery.recipientMemberId).push(delivery);
            return acc;
        }, new Map());

        for (const [memberId, memberDeliveries] of deliveriesByMember.entries()) {
            const recipient = membersMap.get(memberId);

            if (!recipient?.user?.email) {
                continue;
            }

            try {
                await sendDigestNotificationEmail({
                    category,
                    deliveries: memberDeliveries.map(delivery => ({
                        ...delivery,
                        issues: delivery.submission.issues,
                    })),
                    organizationName: organization?.name ?? category.organizationId,
                    recipient: {
                        member: recipient,
                        memberId,
                    },
                });

                await prisma.checklistNotificationDelivery.updateMany({
                    where: {
                        id: {
                            in: memberDeliveries.map(delivery => delivery.id),
                        },
                    },
                    data: {
                        status: "SENT",
                        sentAt: now,
                        errorMessage: null,
                    },
                });

                sentDigests += 1;
            } catch (error) {
                await prisma.checklistNotificationDelivery.updateMany({
                    where: {
                        id: {
                            in: memberDeliveries.map(delivery => delivery.id),
                        },
                    },
                    data: {
                        status: "FAILED",
                        errorMessage: error?.message ?? "Unknown error",
                    },
                });
            }
        }

        await prisma.checklistCategory.update({
            where: {
                id: category.id,
            },
            data: {
                lastDigestRunAt: now,
            },
        });
        processedCategories += 1;
    }

    return {
        processedCategories,
        sentDigests,
    };
}
