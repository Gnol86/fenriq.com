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
        <>
            <Card className="w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">S'inscrire</CardTitle>
                    <CardDescription>
                        Inscrivez-vous pour obtenir un accès à l'application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormSignup />
                </CardContent>
            </Card>
        </>
    );
}
