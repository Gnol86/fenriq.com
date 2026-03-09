import {
    BookOpen,
    CreditCard,
    FolderTree,
    Languages,
    RefreshCw,
    Rocket,
    Settings2,
    ShieldCheck,
    TerminalSquare,
    Users,
    Workflow,
} from "lucide-react";
import { getMessages } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const SECTION_ICONS = {
    overview: BookOpen,
    installation: Rocket,
    commands: TerminalSquare,
    configuration: Settings2,
    structure: FolderTree,
    "access-control": ShieldCheck,
    organizations: Users,
    "server-actions": Workflow,
    "billing-email": CreditCard,
    i18n: Languages,
    updates: RefreshCw,
};

const SECTION_SNIPPETS = {
    installation: `./scripts/setup-new-project.sh

# ou installation manuelle
git clone https://github.com/arnaudmarchot/boilerplate.git my-project
cd my-project
cp .env.example .env
bun install
bun prisma generate
bun prisma db push
bun dev`,
    configuration: `DATABASE_URL="postgresql://user:password@localhost:5432/app"
DATABASE_URL_UNPOOLED="postgresql://user:password@localhost:5432/app"

BETTER_AUTH_SECRET="change-me"
BETTER_AUTH_BASE_URL="http://localhost:3000"

RESEND_API_KEY="re_..."
EMAIL_FROM="My App <noreply@example.com>"

STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."`,
    structure: `import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/access-control";

import { ProductCard } from "@project/components/product-card";
import { createProductAction } from "@project/actions/product.action";
import { useProducts } from "@project/hooks/use-products";`,
    "access-control": `import { checkPermission, requirePermission } from "@/lib/access-control";

export default async function MembersPage() {
    const { organization } = await requirePermission({
        permissions: { member: ["read"] },
    });

    const canDeleteMember = await checkPermission({
        permissions: { member: ["delete"] },
    });

    return <div>{organization.name} - {String(canDeleteMember)}</div>;
}`,
    organizations: `import {
    createOrganizationAction,
    inviteMemberAction,
    setActiveOrganizationAction,
} from "@/actions/organization.action";

await createOrganizationAction({ name: "Acme" });

await inviteMemberAction({
    email: "team@example.com",
    role: "admin",
    organizationId,
});

await setActiveOrganizationAction({ organizationId });`,
    "server-actions": `"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useServerAction } from "@/hooks/use-server-action";
import { saveProductAction } from "@project/actions/product.action";

const formSchema = z.object({
    name: z.string().min(2),
});

export default function ProductForm() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });
    const { execute, isPending } = useServerAction();

    const onSubmit = async values => {
        await execute(() => saveProductAction(values), {
            successMessage: "Saved",
        });
    };

    return <form onSubmit={form.handleSubmit(onSubmit)}>{isPending ? "..." : "OK"}</form>;
}`,
    "billing-email": `import {
    createBillingPortalSession,
    createCheckoutSession,
} from "@/actions/subscription.action";
import { sendVerificationEmail } from "@/actions/email.action";

await createCheckoutSession({
    planId,
    annual: false,
    seats: 10,
});

await createBillingPortalSession();

await sendVerificationEmail({
    email: "user@example.com",
    name: "Jane",
    url: "https://example.com/verify",
});`,
    i18n: `// Server Component
import { getTranslations } from "next-intl/server";

const t = await getTranslations("organization.members");
t("page_title");

// Client Component
import { useTranslations } from "next-intl";

const tCommon = useTranslations("common");
tCommon("save");

// Locale switch
await setLocaleAction({ locale: "fr-FR" });`,
    updates: `git fetch upstream
git merge upstream/main

bun install
bun prisma generate
bun lint`,
};

function CodeSnippet({ title, code }) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{title}</p>
            <pre className="bg-muted overflow-x-auto rounded-md p-4 text-xs leading-6 sm:text-sm">
                <code>{code.trim()}</code>
            </pre>
        </div>
    );
}

function CommandsTable({ commands }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead className="whitespace-normal">Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {commands.map(item => (
                    <TableRow key={item.command}>
                        <TableCell className="font-mono text-xs sm:text-sm">
                            {item.command}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-normal">
                            {item.description}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function SectionCard({ id, section, commands }) {
    const Icon = SECTION_ICONS[id] ?? BookOpen;
    const snippet = SECTION_SNIPPETS[id];

    return (
        <Card id={id} className="scroll-mt-24">
            <CardHeader>
                <div className="flex flex-col gap-3">
                    <Badge variant="outline">{section.eyebrow}</Badge>
                    <div className="flex items-center gap-2">
                        <Icon className="text-muted-foreground size-4" />
                        <CardTitle>{section.title}</CardTitle>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {section.paragraphs?.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {section.paragraphs.map(paragraph => (
                            <p key={paragraph} className="text-muted-foreground leading-7">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                )}

                {id === "commands" && commands?.length > 0 ? (
                    <CommandsTable commands={commands} />
                ) : null}

                {section.bullets?.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <Separator />
                        <p className="text-sm font-medium">{section.bullets_title}</p>
                        <ul className="text-muted-foreground grid gap-2 pl-5 text-sm leading-6">
                            {section.bullets.map(item => (
                                <li key={item} className="list-disc">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {section.note ? (
                    <div className="flex flex-col gap-3">
                        <Separator />
                        <p className="text-muted-foreground text-sm leading-6">{section.note}</p>
                    </div>
                ) : null}

                {snippet && section.snippet_title ? (
                    <div className="flex flex-col gap-3">
                        <Separator />
                        <CodeSnippet title={section.snippet_title} code={snippet} />
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

function SummaryList({ items }) {
    return (
        <ul className="grid gap-3 pl-5 text-sm leading-6">
            {items.map(item => (
                <li key={item.title} className="list-disc">
                    <span className="font-medium">{item.title}</span> {item.description}
                </li>
            ))}
        </ul>
    );
}

export default async function AppPage() {
    const messages = await getMessages();
    const documentation = messages.project.app.index;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3">
                        <Badge variant="outline">{documentation.hero.eyebrow}</Badge>
                        <CardTitle className="text-3xl">{documentation.hero.title}</CardTitle>
                        <CardDescription>{documentation.hero.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {documentation.stack.map(item => (
                            <Badge key={item} variant="secondary">
                                {item}
                            </Badge>
                        ))}
                    </div>
                    <Separator />
                    <SummaryList items={documentation.summary_cards} />
                </CardContent>
            </Card>

            {documentation.section_order.map(sectionId => (
                <SectionCard
                    key={sectionId}
                    id={sectionId}
                    section={documentation.sections[sectionId]}
                    commands={documentation.commands}
                />
            ))}
        </div>
    );
}
