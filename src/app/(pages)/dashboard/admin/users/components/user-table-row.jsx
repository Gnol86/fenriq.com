"use client";

import { useState, Fragment } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { RoleBadge } from "@/components/ui/role-badge";
import ImageProfile from "@/components/image-profile";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import UserActionMenu from "./user-action-menu";
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

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Fragment>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={toggleExpanded}
            >
                {/* Utilisateur avec avatar et informations */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-4">
                            {isExpanded ? (
                                <ChevronDown className="text-muted-foreground" />
                            ) : (
                                <ChevronRight className="text-muted-foreground" />
                            )}
                        </div>
                        <ImageProfile entity={user} size="sm" />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                    {user.name || "Utilisateur"}
                                </span>
                                {isCurrentUser && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        Vous
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
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
                                Banni
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs">
                                Actif
                            </Badge>
                        )}
                        {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">
                                Email vérifié
                            </Badge>
                        )}
                    </div>
                </TableCell>

                {/* Date de création */}
                <TableCell>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                    </span>
                </TableCell>
            </TableRow>

            {/* Ligne de détails conditionnelle */}
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={4} className="p-0">
                        <UserDetailsCollapse
                            user={user}
                            isCurrentUser={isCurrentUser}
                        />
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
}
