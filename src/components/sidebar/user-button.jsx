"use client";
import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Loader2 } from "lucide-react";
import { authClient, signOut } from "@/lib/auth-client";
import { LayoutDashboard } from "lucide-react";
import { AppWindow } from "lucide-react";
import ImageProfile from "../image-profile";
import { HatGlasses } from "lucide-react";
import { toast } from "sonner";
import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { useTranslations } from "next-intl";
import LocalizationButton from "../localization-button";

export default function UserButton({
    user,
    isImpersonating = null,
    currentLocale = "en",
}) {
    const t = useTranslations("sidebar.user_button");
    const router = useRouter();
    const pathname = usePathname();
    const [isSigningOut, startSignOut] = useTransition();
    const [isStoppingImpersonation, stopImpersonating] = useTransition();

    if (!user) {
        return null;
    }

    const isOnApp = pathname?.startsWith("/app");
    const isOnDashboard = pathname?.startsWith("/dashboard");

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

    const handleStopImpersonating = () => {
        stopImpersonating(async () => {
            await authClient.admin.stopImpersonating();

            toast.success(t("success_stop_impersonation"));
            router.push("/dashboard");
            router.refresh();
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 p-2">
                <ImageProfile entity={user} />
                <div className="flex min-w-0 flex-1 flex-col items-start justify-start overflow-hidden text-left">
                    <span className="w-full truncate font-medium">
                        {isImpersonating ? (
                            <span className="text-destructive flex items-center gap-1 truncate">
                                {user.name || t("default_name")}{" "}
                                <HatGlasses
                                    className="text-foreground"
                                    size={16}
                                />
                            </span>
                        ) : (
                            user.name || t("default_name")
                        )}
                    </span>
                    <span className="text-muted-foreground -mt-1 w-full truncate text-xs font-medium">
                        {user.email || ""}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                onCloseAutoFocus={event => event.preventDefault()}
            >
                <DropdownMenuLabel className="flex items-center gap-2">
                    <ImageProfile entity={user} size="xs" />
                    <div className="truncate">
                        {user.name || t("default_name")}
                    </div>
                    <div className="flex-1" />
                    <LocalizationButton
                        currentLocale={currentLocale}
                        size={16}
                    />
                    <AnimatedThemeToggler size={16} />
                </DropdownMenuLabel>
                {!isOnApp && (
                    <DropdownMenuItem asChild>
                        <Link href="/app" className="flex items-center gap-2">
                            <AppWindow
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            {t("return_to_app")}
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
                            {t("dashboard")}
                        </Link>
                    </DropdownMenuItem>
                )}
                {isImpersonating ? (
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={event => {
                            event.preventDefault();
                            if (!isStoppingImpersonation) {
                                handleStopImpersonating();
                            }
                        }}
                        disabled={isStoppingImpersonation}
                        className="flex items-center gap-2"
                    >
                        {isStoppingImpersonation ? (
                            <Loader2
                                size={16}
                                className="animate-spin opacity-60"
                                aria-hidden="true"
                            />
                        ) : (
                            <HatGlasses
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                        )}
                        {t("stop_impersonation")}
                    </DropdownMenuItem>
                ) : (
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
                                className="animate-spin opacity-60"
                                aria-hidden="true"
                            />
                        ) : (
                            <LogOut
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                        )}
                        {t("sign_out")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
