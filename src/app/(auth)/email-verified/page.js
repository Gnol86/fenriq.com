import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <Card className="w-sm">
            <CardHeader>
                <CardTitle className="text-xl text-green-600">
                    Email vérifié ✓
                </CardTitle>
                <CardDescription>
                    Votre adresse email a été vérifiée avec succès ! Vous pouvez
                    maintenant vous connecter à votre compte.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Link href="/app" className="flex-1">
                        <Button className="w-full">
                            Accèder à l&apos;application
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
