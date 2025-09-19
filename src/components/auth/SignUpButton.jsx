import { getUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "../ui/button";

export default async function SignUpButton() {
  const user = await getUser();

  if (user) {
    return null;
  }

  return (
    <Link href="/signup">
      <Button variant="outline">S'inscrire</Button>
    </Link>
  );
}
