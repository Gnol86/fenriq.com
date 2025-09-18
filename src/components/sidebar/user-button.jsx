"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings2, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function UserButton({ user }) {
    const router = useRouter();
    const pathname = usePathname();
    if (!user) {
        return null;
    }

    const isOnApp = pathname?.startsWith("/app");
    const isOnDashboard = pathname?.startsWith("/dashboard");
    const isOnAdmin = pathname?.startsWith("/admin");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-2 cursor-pointer">
                <Avatar className="h-10 w-10 shadow-sm">
                    <AvatarFallback className="bg-background">
                        {getInitials(user.name)}
                    </AvatarFallback>
                    <AvatarImage
                        src={user.image}
                        alt={`Avatar of ${user.name}`}
                    />
                </Avatar>
                <div className="flex flex-col justify-start items-start flex-1 text-left overflow-hidden min-w-0">
                    <span className="font-medium truncate w-full">
                        {user.name}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground -mt-1 truncate w-full">
                        {user.email}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel className="flex items-center gap-2 truncate">
                    <Avatar className="h-5 w-5 shadow-sm">
                        <AvatarFallback className="bg-background text-xs">
                            {user.name
                                .split(" ")
                                .slice(0, 2)
                                .map((word) => word.charAt(0))
                                .join("")
                                .toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar of ${user.name}`}
                        />
                    </Avatar>
                    {user.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isOnApp && (
                    <DropdownMenuItem
                        onSelect={() => {
                            router.push("/app");
                        }}
                    >
                        <FileText
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        Retour à l'application
                    </DropdownMenuItem>
                )}
                {!isOnDashboard && (
                    <DropdownMenuItem
                        onSelect={() => {
                            router.push("/dashboard");
                        }}
                    >
                        <Settings2
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        Parramètres
                    </DropdownMenuItem>
                )}
                {!isOnAdmin && user.role === "admin" && (
                    <DropdownMenuItem
                        onSelect={() => {
                            router.push("/admin");
                        }}
                    >
                        <Shield
                            size={16}
                            className="opacity-60"
                            aria-hidden="true"
                        />
                        Administration
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                        signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    router.push("/");
                                },
                            },
                        });
                    }}
                >
                    <LogOut
                        size={16}
                        className="opacity-60"
                        aria-hidden="true"
                    />
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
