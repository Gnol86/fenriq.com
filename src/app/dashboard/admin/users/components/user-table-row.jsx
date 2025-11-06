"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useState } from "react";
import ImageProfile from "@/components/image-profile";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import UserDetailsCollapse from "./user-details-collapse";

/**
 * Composant ligne de tableau pour afficher un utilisateur
 * @param {Object} props
 * @param {Object} props.user - L'objet utilisateur à afficher
 * @param {string} props.currentUserId - ID de l'utilisateur actuel
 */
export default function UserTableRow({ user, currentUserId }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isCurrentUser = user.id === currentUserId;
    const isBanned = user.banned;
    const tUsers = useTranslations("admin.users");
    const locale = useLocale();

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Fragment>
            <TableRow className="cursor-pointer" onClick={toggleExpanded}>
                {/* Utilisateur avec avatar et informations */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="flex w-4 items-center justify-center">
                            {isExpanded ? (
                                <ChevronDown className="text-muted-foreground" />
                            ) : (
                                <ChevronRight className="text-muted-foreground" />
                            )}
                        </div>
                        <ImageProfile entity={user} size="sm" />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm font-medium">
                                    {user.name || tUsers("table_user")}
                                </span>
                                {isCurrentUser && (
                                    <Badge variant="secondary" className="text-xs">
                                        {tUsers("badge_you")}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-muted-foreground text-xs">{user.email}</span>
                        </div>
                    </div>
                </TableCell>

                {/* Rôle de l'utilisateur */}
                <TableCell>
                    <RoleBadge role={user.role} />
                </TableCell>

                {/* Statut */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        {isBanned ? (
                            <Badge variant="destructive" className="text-xs">
                                {tUsers("status_banned")}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs">
                                {tUsers("status_active")}
                            </Badge>
                        )}
                        {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">
                                {tUsers("status_email_verified")}
                            </Badge>
                        )}
                    </div>
                </TableCell>

                {/* Date de création */}
                <TableCell>
                    <span className="text-muted-foreground text-sm">
                        {formatDate(user.createdAt, locale)}
                    </span>
                </TableCell>
            </TableRow>

            {/* Ligne de détails conditionnelle */}
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={4} className="p-0">
                        <UserDetailsCollapse user={user} isCurrentUser={isCurrentUser} />
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
}
