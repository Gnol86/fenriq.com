"use client";

import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export function SidebarToggler() {
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
    console.log("Rendering SidebarToggler");
    return (
        <Button
            onClick={toggleSidebar}
            variant="outline"
            size="icon"
            key={pathname}
        >
            <PanelLeft />
        </Button>
    );
}
