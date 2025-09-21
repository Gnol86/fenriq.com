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
import { LogOut, Shield, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { LayoutDashboard } from "lucide-react";
import { AppWindow } from "lucide-react";
import ImageProfile from "../image-profile";

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <ImageProfile user={user} />
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
                    <ImageProfile user={user} size="xs" />
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
