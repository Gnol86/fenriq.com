import FormSignin from "./form";
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
            <CardHeader>
                <CardTitle className="text-xl">Se connecter</CardTitle>
                <CardDescription>
                    Connectez-vous à votre compte pour accéder à l'application
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FormSignin />
            </CardContent>
        </Card>
    );
}
