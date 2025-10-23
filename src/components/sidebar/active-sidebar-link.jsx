"use client";

import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Spinner } from "../ui/spinner";

// Composant interne qui doit être rendu à l'intérieur du Link pour accéder à useLinkStatus
function LinkContent({ children }) {
    const { pending } = useLinkStatus();
    return (
        <>
            {children}
            {pending && (
                <span className="ml-auto">
                    <Spinner className="size-4" />
                </span>
            )}
        </>
    );
}

export function ActiveSidebarLink({ href, children, className }) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();
    const isActive = pathname === href;

    return (
        <SidebarMenuButton asChild isActive={isActive} className={className}>
            <Link href={href} onNavigate={() => setOpenMobile(false)}>
                <LinkContent>{children}</LinkContent>
            </Link>
        </SidebarMenuButton>
    );
}
