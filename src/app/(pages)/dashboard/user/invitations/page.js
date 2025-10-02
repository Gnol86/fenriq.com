import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PrismaClient } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";

export default async function Page() {
    const t = await getTranslations("user.invitations");
    const tCommon = await getTranslations("common");
    const locale = await getLocale();
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;

    if (!user) {
        notFound();
    }

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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table_organization")}</TableHead>
                                <TableHead>{t("table_invited_by")}</TableHead>
                                <TableHead>{t("table_role")}</TableHead>
                                <TableHead>{t("table_expiration")}</TableHead>
                                <TableHead className="text-right">
                                    {t("table_action")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        {invitations.length > 0 ? (
                            invitations.map(invitation => {
                                return (
                                    <TableBody key={invitation.id}>
                                        <TableRow>
                                            <TableCell>
                                                {invitation.organization?.name ||
                                                    tCommon("n_a")}
                                            </TableCell>
                                            <TableCell>
                                                {invitation.user?.name ||
                                                    invitation.user?.email ||
                                                    tCommon("n_a")}
                                            </TableCell>
                                            <TableCell>
                                                {invitation.role}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    invitation.expiresAt,
                                                    locale
                                                )}
                                            </TableCell>
                                            <TableCell className="flex justify-end items-center gap-2">
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
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                );
                            })
                        ) : (
                            <TableCaption className="text-center">
                                {t("no_invitations")}
                            </TableCaption>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
