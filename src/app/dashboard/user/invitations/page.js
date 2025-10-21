import ImageProfile from "@/components/image-profile";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item";
import { requireAuth } from "@/lib/access-control";
import { formatDate } from "@/lib/utils";
import { PrismaClient } from "@root/prisma/generated";
import { Eye, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";

export default async function Page() {
    const t = await getTranslations("user.invitations");
    const tCommon = await getTranslations("common");
    const locale = await getLocale();

    // Vérifie que l'utilisateur est authentifié
    const { user } = await requireAuth();

    const prisma = new PrismaClient();
    const invitations = await prisma.invitation.findMany({
        where: {
            email: user.email,
            status: "pending",
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            organization: true,
            user: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {t("page_title")}
                    </CardTitle>
                    <CardDescription>{t("page_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!invitations.length ? (
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Mail />
                                </EmptyMedia>
                                <EmptyTitle>{t("no_invitations")}</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <ItemGroup>
                            {invitations.map((invitation, index) => (
                                <React.Fragment key={invitation.id}>
                                    <Item variant="outline" size="sm">
                                        <ItemMedia>
                                            <ImageProfile
                                                entity={invitation.organization}
                                            />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>
                                                {invitation.organization.name}
                                            </ItemTitle>
                                            <ItemDescription className="flex flex-col">
                                                <span>
                                                    {t("table_invited_by")}
                                                    {" : "}
                                                    {invitation.user?.name ||
                                                        invitation.user
                                                            ?.email ||
                                                        tCommon("n_a")}
                                                </span>
                                                <span>
                                                    {t("table_role")}
                                                    {" : "}
                                                    {invitation.role}
                                                </span>
                                                <span>
                                                    {t("table_expiration")}
                                                    {" : "}
                                                    {formatDate(
                                                        invitation.expiresAt,
                                                        locale
                                                    )}
                                                </span>
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-2"
                                                asChild
                                            >
                                                <Link
                                                    href={`/invitations/${invitation.id}`}
                                                >
                                                    <Eye /> {t("view_button")}
                                                </Link>
                                            </Button>
                                        </ItemActions>
                                    </Item>
                                    {index !== invitations.length - 1 && (
                                        <ItemSeparator />
                                    )}
                                </React.Fragment>
                            ))}
                        </ItemGroup>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
