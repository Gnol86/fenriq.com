"use client";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "../ui/button";

export default function SignOutButton() {
    const { data: session } = useSession();
    
    if (!session?.user) {
        return null;
    }
    
    const handleSignOut = async () => {
        await signOut();
    };
    
    return (
        <Button variant="outline" onClick={handleSignOut}>
            Se déconnecter
        </Button>
    );
}