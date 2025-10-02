"use client";

import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

export default function RemoveMemberDialog({
    open,
    member,
    isRemoving,
    onConfirm,
    onCancel,
}) {
    const memberName = member?.user?.name;
    const t = useTranslations("organization.members");

    return (
        <AlertDialog
            open={open}
            onOpenChange={nextOpen => {
                if (!nextOpen && !isRemoving) {
                    onCancel?.();
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t("remove_dialog_title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {memberName
                            ? t("remove_dialog_description", {
                                  name: memberName,
                              })
                            : t("remove_dialog_description_fallback")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isRemoving}
                        onClick={() => {
                            if (!isRemoving) {
                                onCancel?.();
                            }
                        }}
                    >
                        {t("remove_dialog_cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isRemoving}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isRemoving && (
                            <Loader2
                                className="mr-2 h-4 w-4 animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        {t("remove_dialog_confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
