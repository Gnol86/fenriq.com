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

export default async function InvitationPage({ params }) {
    const { invitationId } = params;

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
                            Invitation à rejoindre{" "}
                            {invitation.organization.name}
                        </CardTitle>
                        <CardDescription>
                            Vous avez été invité(e) par {invitation.user.name} à
                            rejoindre l&apos;organisation{" "}
                            {invitation.organization.name} en tant que &quot;
                            {invitation.role}&quot;.
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
