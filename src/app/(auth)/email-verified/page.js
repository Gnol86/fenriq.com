import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
    return (
        <Card className="w-sm">
            <CardHeader className="flex items-start gap-4">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={75}
                    height={75}
                />
                <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl text-green-600">
                        Email vérifié ✓
                    </CardTitle>
                    <CardDescription>
                        Votre adresse email a été vérifiée avec succès ! Vous
                        pouvez maintenant vous connecter à votre compte.
                    </CardDescription>
                </div>
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
