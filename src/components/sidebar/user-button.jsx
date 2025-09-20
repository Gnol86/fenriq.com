"use client";
import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Shield, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";
import { AppWindow } from "lucide-react";

export default function UserButton({ user }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSigningOut, startSignOut] = useTransition();

    if (!user) {
        return null;
    }

    const isOnApp = pathname?.startsWith("/app");
    const isOnDashboard = pathname?.startsWith("/dashboard");
    const isOnAdmin = pathname?.startsWith("/admin");

    const handleSignOut = () => {
        startSignOut(async () => {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                },
            });
        });
    };

    const userInitials = getInitials(user.name || user.email || "Utilisateur");
    const compactName = (user.name || "Utilisateur")
        .split(" ")
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join("")
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <Avatar className="h-10 w-10 shadow-sm">
                    <AvatarFallback className="bg-background">
                        {userInitials}
                    </AvatarFallback>
                    <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                    />
                </Avatar>
                <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
                    <span className="font-medium truncate w-full">
                        {user.name || "Utilisateur"}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
                        {user.email || ""}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={event => event.preventDefault()}
            >
                <DropdownMenuLabel className="flex items-center gap-2 truncate">
                    <Avatar className="h-5 w-5 shadow-sm">
                        <AvatarFallback className="bg-background text-xs">
                            {compactName || userInitials}
                        </AvatarFallback>
                        <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name || "Utilisateur"}
                        />
                    </Avatar>
                    {user.name || "Utilisateur"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isOnApp && (
                    <DropdownMenuItem asChild>
                        <Link href="/app" className="flex items-center gap-2">
                            <AppWindow
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            Retour à l'application
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isOnDashboard && (
                    <DropdownMenuItem asChild>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2"
                        >
                            <LayoutDashboard
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isOnAdmin && user.role === "admin" && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                            <Shield
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            Administration
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={event => {
                        event.preventDefault();
                        if (!isSigningOut) {
                            handleSignOut();
                        }
                    }}
                    disabled={isSigningOut}
                    className="flex items-center gap-2"
                >
                    {isSigningOut ? (
                        <Loader2
                            size={16}
                            className="opacity-60 animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <LogOut
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                    )}
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
