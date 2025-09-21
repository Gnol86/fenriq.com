import Image from "next/image";
import FormResendVerification from "./form";
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
                    <CardTitle className="text-xl">
                        Vérification de l&apos;email
                    </CardTitle>
                    <CardDescription>
                        Votre compte n&apos;est pas encore vérifié. Vérifiez
                        votre boîte email ou demandez un nouveau lien de
                        vérification.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <FormResendVerification />
            </CardContent>
        </Card>
    );
}
