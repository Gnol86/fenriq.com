import Image from "next/image";
import FormSignup from "./form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
                    <CardTitle className="text-xl">S&apos;inscrire</CardTitle>
                    <CardDescription>
                        Inscrivez-vous pour obtenir un accès à
                        l&apos;application
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <FormSignup />
            </CardContent>
        </Card>
    );
}
