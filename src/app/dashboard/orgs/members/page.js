import MembersManager from "./members-manager";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function OrganizationMembersPage() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Membres de l&apos;organisation</CardTitle>
                    <CardDescription>
                        Gérez les accès, invitez de nouveaux membres et suivez
                        les invitations en cours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MembersManager />
                </CardContent>
            </Card>
        </div>
    );
}
