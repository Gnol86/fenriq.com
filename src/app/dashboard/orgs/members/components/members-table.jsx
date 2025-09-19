"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { defaultRoleLabels } from "./constants";
import { formatMemberSince } from "./utils";

export default function MembersTable({
    members,
    onRoleChange,
    onRemove,
    isUpdatingMemberId,
    currentUserId,
}) {
    if (!members.length) {
        return (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucun membre actif pour le moment.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Depuis</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map(member => {
                    const emailVerified = member?.user?.emailVerified ?? false;
                    const memberRole = member?.role ?? "member";
                    const memberUserId = member?.user?.id ?? member?.userId;
                    const isSelf = Boolean(
                        currentUserId && memberUserId === currentUserId
                    );
                    const roleChangeDisabled =
                        isSelf || isUpdatingMemberId === member.id;
                    return (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {getInitials(
                                                member?.user?.name ||
                                                    member?.user?.email ||
                                                    "?"
                                            )}
                                        </AvatarFallback>
                                        {member?.user?.image ? (
                                            <AvatarImage
                                                src={member.user.image}
                                                alt={`Avatar de ${member?.user?.name || member?.user?.email}`}
                                            />
                                        ) : null}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                            {member?.user?.name ||
                                                "Utilisateur"}
                                        </span>
                                        {member?.id ? (
                                            <span className="text-xs text-muted-foreground">
                                                ID: {member.id.slice(0, 8)}…
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={cn(
                                        "text-sm",
                                        emailVerified
                                            ? "text-foreground"
                                            : "text-destructive"
                                    )}
                                >
                                    {member?.user?.email || "-"}
                                </span>
                                {!emailVerified && (
                                    <span className="block text-xs text-muted-foreground">
                                        Email non vérifiée
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-medium text-foreground">
                                    {defaultRoleLabels[memberRole] ??
                                        memberRole}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {formatMemberSince(member?.createdAt)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            aria-label="Actions du membre"
                                            disabled={isSelf}
                                        >
                                            <MoreHorizontal
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                Modifier le rôle
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {Object.entries(
                                                    defaultRoleLabels
                                                ).map(([role, label]) => (
                                                    <DropdownMenuItem
                                                        key={role}
                                                        onSelect={event => {
                                                            event.preventDefault();
                                                            onRoleChange?.(
                                                                member.id,
                                                                role,
                                                                memberRole
                                                            );
                                                        }}
                                                        disabled={
                                                            roleChangeDisabled ||
                                                            memberRole === role
                                                        }
                                                    >
                                                        <span className="text-sm">
                                                            {label}
                                                        </span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={event => {
                                                event.preventDefault();
                                                onRemove?.(member);
                                            }}
                                            disabled={
                                                memberRole === "owner" || isSelf
                                            }
                                        >
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
