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

export default function RemoveMemberDialog({
    open,
    member,
    isRemoving,
    onConfirm,
    onCancel,
}) {
    const memberName = member?.user?.name;

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
                    <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action retirera l&apos;accès de
                        {memberName ? ` ${memberName}` : " ce membre"}
                        {" à l'organisation."}
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
                        Annuler
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
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
