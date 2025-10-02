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
import { useTranslations } from "next-intl";

export default function AdminRemoveMemberDialog({
    open,
    onOpenChange,
    member,
    organizationId,
    organizationSlug,
}) {
    const router = useRouter();
    const { execute, isPending } = useServerAction();
    const tMembers = useTranslations("admin.org_members");
    const tOrgMembers = useTranslations("organization.members");
    const memberName = member?.user?.name || member?.user?.email;

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
                successMessage: tMembers("remove_success", {
                    name: memberName || tMembers("owners_badge_self"),
                }),
                onSuccess: () => {
                    onOpenChange(false);
                    router.refresh();
                },
            }
        );
    }, [
        execute,
        member?.id,
        memberName,
        onOpenChange,
        organizationId,
        router,
        tMembers,
    ]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {tMembers("remove_dialog_admin_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {memberName
                            ? tOrgMembers("remove_dialog_description", {
                                  name: memberName,
                              })
                            : tOrgMembers("remove_dialog_description_fallback")}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <h4 className="font-medium text-destructive mb-2">
                        {tMembers("remove_dialog_consequences_title")}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>{tMembers("remove_dialog_consequence_1")}</li>
                        <li>{tMembers("remove_dialog_consequence_2")}</li>
                        <li>{tMembers("remove_dialog_consequence_3")}</li>
                        <li>{tMembers("remove_dialog_consequence_4")}</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        {tOrgMembers("remove_dialog_cancel")}
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
                        {tOrgMembers("remove_dialog_confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
