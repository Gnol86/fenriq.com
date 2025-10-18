/**
 * ============================================================
 * EXAMPLE: Project Component
 * ============================================================
 *
 * This is an example of a project-specific component.
 * It demonstrates best practices for creating components
 * in your project.
 *
 * Location: src/project/components/
 * Usage: Import with @project/components/my-component
 * ============================================================
 */

"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { useTranslations } from "next-intl";
// import { myAction } from "@project/actions/my.action";

export default function ExampleComponent({ data }) {
    const t = useTranslations("project.example");
    const { isPending } = useServerAction();

    const handleAction = async () => {
        // await execute(() => myAction(data.id), {
        //     loadingMessage: t("loading"),
        //     successMessage: t("success"),
        //     errorMessage: t("error"),
        // });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <p>{data?.name ?? "Example Data"}</p>
                    <Button onClick={handleAction} disabled={isPending}>
                        {isPending ? t("processing") : t("action_button")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * ============================================================
 * TRANSLATIONS EXAMPLE
 * ============================================================
 *
 * Add to src/messages/en.project.json:
 *
 * {
 *   "example": {
 *     "title": "Example Component",
 *     "description": "This is an example component",
 *     "action_button": "Click Me",
 *     "processing": "Processing...",
 *     "loading": "Loading...",
 *     "success": "Action completed successfully!",
 *     "error": "An error occurred"
 *   }
 * }
 *
 * ============================================================
 */
