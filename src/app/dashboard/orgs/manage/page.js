import ManageOrganizationForm from "./form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ManageOrganizationPage() {
  return (
    <div className="min-h-dvh flex flex-col gap-6 justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Gérer l&apos;organisation</CardTitle>
          <CardDescription>
            Modifiez les informations principales de votre organisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManageOrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
