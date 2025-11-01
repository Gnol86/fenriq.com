"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlanForm from "./plan-form";

export default function EditPlanButton({ plan }) {
    return (
        <PlanForm
            plan={plan}
            trigger={
                <Button variant="outline" size="icon-sm">
                    <Pencil />
                </Button>
            }
        />
    );
}
