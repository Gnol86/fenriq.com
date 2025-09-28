"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { removeMemberAsAdminAction } from "@/actions/admin.action";

export default function AdminRemoveMemberDialog({
    open,
    onOpenChange,
    member,
    organizationId,
    organizationSlug,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();

    const handleRemoveMember = useCallback(async () => {
        if (!organizationId || !member?.id) {
            return;
        }

        await execute(
            () =>
                removeMemberAsAdminAction({
                    memberIdOrEmail: member.id,
                    organizationId,
                }),
            {
                successMessage: `${member.user?.name || member.user?.email} supprimé de l'organisation (Admin)`,
                onSuccess: () => {
                    onOpenChange(false);
                    router.refresh();
                },
            }
        );
    }, [
        member?.id,
        organizationId,
        router,
        execute,
        onOpenChange,
        member.user,
    ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Confirmer la suppression (Admin)
                    </DialogTitle>
                    <DialogDescription>
                        Vous êtes sur le point de supprimer{" "}
                        <strong>
                            {member?.user?.name || member?.user?.email}
                        </strong>{" "}
                        de l&apos;organisation. En tant qu&apos;administrateur,
                        cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <h4 className="font-medium text-destructive mb-2">
                        Conséquences de cette action :
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                            • L&apos;utilisateur perdra accès à
                            l&apos;organisation
                        </li>
                        <li>
                            • Ses permissions seront révoquées immédiatement
                        </li>
                        <li>
                            • Il devra être ré-invité pour retrouver
                            l&apos;accès
                        </li>
                        <li>• Toutes ses sessions actives seront terminées</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveMember}
                        disabled={isPending}
                    >
                        {isPending && (
                            <Loader2
                                className="mr-2 h-4 w-4 animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        Supprimer définitivement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
