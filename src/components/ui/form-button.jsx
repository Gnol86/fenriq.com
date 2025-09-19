"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export default function FormButton({ children, loading, ...props }) {
  return (
    <Button {...props} disabled={loading}>
      {loading && (
        <div className="absolute flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {<div className={cn(loading && "opacity-0")}>{children}</div>}
    </Button>
  );
}
