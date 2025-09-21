import Image from "next/image";
import AcceptInvitationClient from "./accept-invitation-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function InvitationPage({ params }) {
    const { invitationId } = params;

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
                            Invitation à rejoindre une organisation
                        </CardTitle>
                        <CardDescription>
                            Confirmez que vous souhaitez rejoindre cette
                            organisation.
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
