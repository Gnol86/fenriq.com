"use client";

import { useState, Fragment } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Building2 } from "lucide-react";
import OrganizationActionMenu from "./organization-action-menu";
import OrganizationDetailsCollapse from "./organization-details-collapse";

/**
 * Composant ligne de tableau pour afficher une organisation
 * @param {Object} props
 * @param {Object} props.organization - L'objet organisation à afficher
 */
export default function OrganizationTableRow({ organization, currentUserId }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Fragment>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={toggleExpanded}
            >
                {/* Organisation avec logo et informations */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-4">
                            {isExpanded ? (
                                <ChevronDown className="text-muted-foreground" />
                            ) : (
                                <ChevronRight className="text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                            {organization.logo ? (
                                <img
                                    src={organization.logo}
                                    alt={organization.name}
                                    className="w-8 h-8 rounded-md object-cover"
                                />
                            ) : (
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {organization.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {organization.slug}
                            </span>
                        </div>
                    </div>
                </TableCell>

                {/* Nombre de membres */}
                <TableCell>
                    <Badge variant="secondary" className="text-xs">
                        {organization.members?.length || 0} membre(s)
                    </Badge>
                </TableCell>

                {/* Statut */}
                <TableCell>
                    <Badge variant="outline" className="text-xs">
                        Active
                    </Badge>
                </TableCell>

                {/* Date de création */}
                <TableCell>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(organization.createdAt)}
                    </span>
                </TableCell>
            </TableRow>

            {/* Ligne de détails conditionnelle */}
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={4} className="p-0">
                        <OrganizationDetailsCollapse
                            organization={organization}
                            currentUserId={currentUserId}
                        />
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
}
