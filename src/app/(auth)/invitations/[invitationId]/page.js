import { Mailbox } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth } from "@/lib/access-control";
import { getInvitationDisplayStatus } from "@/lib/invitation-utils";
import prisma from "@/lib/prisma";
import AcceptInvitationClient from "./accept-invitation-client";

function getStatusMessageKey(statusKey) {
    switch (statusKey) {
        case "accepted":
            return "already_accepted_message";
        case "rejected":
            return "already_rejected_message";
        case "canceled":
            return "canceled_message";
        case "outdated":
            return "outdated_message";
        default:
            return "invalid_message";
    }
}

export default async function InvitationPage({ params }) {
    const { invitationId } = await params;
    const t = await getTranslations("auth.invitation");
    const tRoles = await getTranslations("roles");
    const invitation = await prisma.invitation.findUnique({
        where: {
            id: invitationId,
        },
        include: {
            organization: true,
            user: true,
        },
    });

    if (!invitation) {
        notFound();
    }

    const { user } = await getAuth();

    if (!user) {
        redirect(`/signin?callback=${encodeURIComponent(`/invitations/${invitationId}`)}`);
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        notFound();
    }

    const invitationRole = invitation.role ?? "member";
    const inviterName = invitation.user.name ?? invitation.user.email ?? "--";
    const invitationStatus = getInvitationDisplayStatus(invitation);
    const isActionable = invitationStatus === "pending";
    const statusMessageKey = getStatusMessageKey(invitationStatus);

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
            <Card className="w-sm">
                <CardHeader className="flex items-start gap-4">
                    <div>
                        <CardTitle className="text-xl">
                            {t("page_title", {
                                orgName: invitation.organization.name,
                            })}
                        </CardTitle>
                        <CardDescription>
                            {t("page_description", {
                                userName: inviterName,
                                orgName: invitation.organization.name,
                                role: tRoles(invitationRole),
                            })}
                        </CardDescription>
                    </div>
                    <div>
                        <Mailbox size={42} className="text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isActionable ? (
                        <AcceptInvitationClient invitationId={invitationId} />
                    ) : (
                        <p className="text-muted-foreground text-sm">{t(statusMessageKey)}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
