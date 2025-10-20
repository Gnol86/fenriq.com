import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@root/prisma/generated";
import { Mailbox } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AcceptInvitationClient from "./accept-invitation-client";

export default async function InvitationPage({ params }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { invitationId } = await params;
    const t = await getTranslations("auth.invitation");
    const tRoles = await getTranslations("roles");

    const prisma = new PrismaClient();
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

    if (!session) {
        redirect(
            `/signin?callback=${encodeURIComponent(`/invitations/${invitationId}`)}`
        );
    }

    if (session && session.user.email !== invitation.email) {
        notFound();
    }

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
                                userName: invitation.user.name,
                                orgName: invitation.organization.name,
                                role: tRoles(invitation.role),
                            })}
                        </CardDescription>
                    </div>
                    <div>
                        <Mailbox size={42} className="text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <AcceptInvitationClient invitationId={invitationId} />
                </CardContent>
            </Card>
        </div>
    );
}
