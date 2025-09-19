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
                <CardHeader>
                    <CardTitle>
                        Invitation à rejoindre une organisation
                    </CardTitle>
                    <CardDescription>
                        Confirmez que vous souhaitez rejoindre cette
                        organisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AcceptInvitationClient invitationId={invitationId} />
                </CardContent>
            </Card>
        </div>
    );
}
