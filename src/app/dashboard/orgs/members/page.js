import MembersManager from "./members-manager";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/data-access";

export default async function OrganizationMembersPage() {
    const user = await requireUser();
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
