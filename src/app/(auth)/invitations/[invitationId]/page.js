import Image from "next/image";
import AcceptInvitationClient from "./accept-invitation-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PrismaClient } from "@/generated/prisma";
import { getTranslations } from "next-intl/server";

export default async function InvitationPage({ params }) {
    const { invitationId } = params;
    const t = await getTranslations("auth.invitation");

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

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex items-start gap-4">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={75}
                        height={75}
                    />
                    <div className="flex flex-col gap-2">
                        <CardTitle>
                            {t("page_title")} {invitation.organization.name}
                        </CardTitle>
                        <CardDescription>
                            {t("page_description_invited_by")} {invitation.user.name} {t("page_description_to_join")} {invitation.organization.name} {t("page_description_as_role")} &quot;{invitation.role}&quot;.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <AcceptInvitationClient invitationId={invitationId} />
                </CardContent>
            </Card>
        </div>
    );
}
