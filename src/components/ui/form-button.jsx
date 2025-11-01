"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export default function FormButton({ children, loading, ...props }) {
    return (
        <Button {...props} disabled={loading}>
            {loading && (
                <div className="absolute flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                </div>
            )}
            {
                <div
                    className={cn(
                        loading && "opacity-0",
                        "inline-flex items-center gap-2"
                    )}
                >
                    {children}
                </div>
            }
        </Button>
    );
}
