import UserSettingsForm from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function UserSettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;

    if (!user) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres du compte</CardTitle>
                    <CardDescription>
                        Modifiez vos informations personnelles et préférences de
                        compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserSettingsForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
