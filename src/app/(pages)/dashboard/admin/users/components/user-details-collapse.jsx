"use client";

import {
    listUserSessionsAction,
    revokeUserSessionAction,
    revokeUserSessionsAction,
} from "@/actions/admin.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { useConfirm } from "@/hooks/use-confirm";
import { formatDate } from "@/lib/utils";
import {
    Calendar,
    Check,
    Clock,
    Mail,
    MapPin,
    Monitor,
    Plus,
    Shield,
    Trash2,
    UserLock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import UserActionMenu from "./user-action-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations, useLocale } from "next-intl";

export default function UserDetailsCollapse({ user, isCurrentUser }) {
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const { execute } = useServerAction();
    const confirm = useConfirm();
    const tUsers = useTranslations("admin.users");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    // Charger les sessions de l'utilisateur
    useEffect(() => {
        const loadSessions = async () => {
            setLoadingSessions(true);
            try {
                const result = await listUserSessionsAction({
                    userId: user.id,
                });
                setSessions(result?.sessions || []);
            } catch (error) {
                console.error("Erreur lors du chargement des sessions:", error);
                setSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        };

        loadSessions();
    }, [user.id]);

    const handleRevokeSession = async sessionToken => {
        await execute(() => revokeUserSessionAction({ sessionToken }), {
            successMessage: tUsers("sessions_revoke_success"),
        });

        // Recharger les sessions
        setSessions(prev =>
            prev.filter(session => session.token !== sessionToken)
        );
    };

    const handleRevokeAllSessions = async () => {
        await confirm(
            {
                title: tUsers("sessions_revoke_confirm", {
                    name: user.name || user.email,
                }),
                variant: "destructive",
            },
            async () => {
                await execute(() => revokeUserSessionsAction({ userId: user.id }), {
                    successMessage: tUsers("sessions_revoke_all_success"),
                });
                setSessions([]);
            }
        );
    };

    const formatSessionDate = date => {
        if (!date) return tCommon("n_a");
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return tCommon("n_a");

        return new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(dateObj);
    };

    const getUserAgent = userAgent => {
        if (!userAgent) return tUsers("sessions_unknown");

        // Extraction simple du navigateur et OS
        if (userAgent.includes("Chrome")) return "Chrome";
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Safari")) return "Safari";
        if (userAgent.includes("Edge")) return "Edge";
        return tUsers("sessions_unknown");
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between w-full ">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Shield className="h-4 w-4 mt-0.25" />
                            {tUsers("details_title")}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tUsers("details_id")}
                            </div>
                            <p className="font-mono text-xs break-all">
                                {user.id}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tUsers("details_email")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                                {user.emailVerified ? (
                                    <Check
                                        size={16}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <Plus
                                        size={18}
                                        className="text-destructive rotate-45"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tUsers("details_created")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(user.createdAt, locale)}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="font-medium text-muted-foreground">
                                {tUsers("details_updated")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(user.updatedAt, locale)}
                            </div>
                        </div>
                        {user.banned && (
                            <div className="flex gap-1">
                                <div className="font-medium text-destructive">
                                    {tUsers("details_banned")}
                                </div>
                                <div className="flex flex-col gap-1">
                                    {user.banReason && (
                                        <div className="flex items-center gap-1">
                                            <UserLock className="h-3 w-3" />
                                            {tUsers("details_ban_reason")}: {user.banReason}
                                        </div>
                                    )}
                                    {user.banExpiresIn && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {tUsers("details_ban_expires")}: {user.banExpiresIn}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between w-full ">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Monitor className="h-4 w-4 mt-0.25" />
                            {tUsers("sessions_title", { count: sessions.length })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        {sessions.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleRevokeAllSessions}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {tUsers("sessions_revoke_all")}
                            </Button>
                        )}
                        {loadingSessions ? (
                            <div className="text-center py-4 text-muted-foreground">
                                {tUsers("sessions_loading")}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                {tUsers("sessions_empty")}
                            </div>
                        ) : (
                            <ScrollArea onCard className="max-h-40 ">
                                <div className="flex flex-col gap-2">
                                    {sessions.map(session => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 border rounded-md"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {getUserAgent(
                                                            session.userAgent
                                                        )}
                                                    </Badge>
                                                    {session.ipAddress && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {session.ipAddress}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {tUsers("sessions_created")}{" "}
                                                    {formatSessionDate(session.createdAt)}
                                                </div>
                                                {session.expiresAt && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {tUsers("sessions_expires")}{" "}
                                                        {formatSessionDate(session.expiresAt)}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRevokeSession(
                                                        session.token
                                                    )
                                                }
                                                className="ml-2"
                                                aria-label={tUsers(
                                                    "sessions_revoke_all"
                                                )}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>
            <UserActionMenu user={user} isCurrentUser={isCurrentUser} />
        </div>
    );
}
