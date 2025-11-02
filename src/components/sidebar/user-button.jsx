"use client";
import { cn } from "@root/src/lib/utils";
import {
    AppWindow,
    ChevronsUpDown,
    HatGlasses,
    LayoutDashboard,
    Loader2,
    LogOut,
    Settings2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { authClient, signOut } from "@/lib/auth-client";
import ImageProfile from "../image-profile";
import LocalizationSubdropdown from "../localization-subdropdown";
import ThemeSubdropdown from "../theme-subdropdown";

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
    const { isMobile, setOpenMobile } = useSidebar();

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

    const handleNavigate = href => event => {
        event.preventDefault();

        if (isMobile) {
            setOpenMobile(false);
        }
        router.push(href);
    };

    return (
        <SidebarMenuItem className="mb-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <ImageProfile entity={user} size="sm" />

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span
                                className={cn(
                                    "truncate font-medium",
                                    isImpersonating && "text-destructive"
                                )}
                            >
                                {user.name || t("default_name")}
                            </span>
                            <span className="truncate text-xs">
                                {user.email}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                    onCloseAutoFocus={event => event.preventDefault()}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <ImageProfile entity={user} size="sm" />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!isOnApp && (
                        <DropdownMenuItem
                            onSelect={handleNavigate("/app")}
                            className="flex items-center gap-2"
                        >
                            <AppWindow
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            {t("return_to_app")}
                        </DropdownMenuItem>
                    )}
                    {!isOnDashboard && (
                        <DropdownMenuItem
                            onSelect={handleNavigate("/dashboard")}
                            className="flex items-center gap-2"
                        >
                            <LayoutDashboard
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            {t("dashboard")}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-2">
                            <Settings2
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                            <span>Parramètres</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <LocalizationSubdropdown
                                    currentLocale={currentLocale}
                                />
                                <ThemeSubdropdown />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
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
        </SidebarMenuItem>
    );
}
