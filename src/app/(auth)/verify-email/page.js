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
      <CardHeader>
        <CardTitle className="text-xl">Vérification de l&apos;email</CardTitle>
        <CardDescription>
          Votre compte n&apos;est pas encore vérifié. Vérifiez votre boîte email
          ou demandez un nouveau lien de vérification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormResendVerification />
      </CardContent>
    </Card>
  );
}
