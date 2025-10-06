"use client";

import { useContext } from "react";
import { DialogContext } from "@/components/providers/dialog-provider";

export function useConfirm() {
    const context = useContext(DialogContext);

    if (!context) {
        throw new Error("useConfirm must be used within a DialogProvider");
    }

    return context.confirm;
}
