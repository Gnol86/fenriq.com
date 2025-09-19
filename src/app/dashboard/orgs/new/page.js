import NewOrganizationForm from "./form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-dvh flex flex-col gap-6 justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Créer une organisation</CardTitle>
          <CardDescription>
            Donnez un nom à votre organisation pour commencer à collaborer avec
            votre équipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewOrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
