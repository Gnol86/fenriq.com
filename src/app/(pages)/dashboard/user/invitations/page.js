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
import { requireUser } from "@/lib/auth-access";
import { PrismaClient } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";

export default async function Page() {
    const user = await requireUser();

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
                        Mes invitations
                    </CardTitle>
                    <CardDescription>
                        Liste des invitations envoyées à votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Organisation</TableHead>
                                <TableHead>Invité par</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Expiration</TableHead>
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        {invitations.length > 0 ? (
                            invitations.map(invitation => {
                                return (
                                    <TableBody>
                                        <TableRow key={invitation.id}>
                                            <TableCell>
                                                {invitation.organization
                                                    ?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {invitation.user?.name ||
                                                    invitation.user?.email ||
                                                    "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {invitation.role}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    invitation.expiresAt
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
                                                        <Eye /> Voir
                                                        l'invitation
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                );
                            })
                        ) : (
                            <TableCaption className="text-center">
                                Aucune invitation en attente
                            </TableCaption>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
