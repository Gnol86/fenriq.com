import {
    BellRing,
    BookOpen,
    Camera,
    CarFront,
    ClipboardList,
    History,
    ShieldCheck,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/actions/auth.action";
import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import LocalizationButton from "@/components/localization-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteConfig } from "@/site-config";

const BENEFIT_ICONS = {
    standardize: ClipboardList,
    document: Camera,
    secure: ShieldCheck,
};

const STEP_ICONS = {
    prepare: BookOpen,
    inspect: CarFront,
    follow_up: BellRing,
};

const FEATURE_ICONS = {
    templates: ClipboardList,
    photos: Camera,
    history: History,
    sharing: Users,
};

function LandingAuthActions({
    authLabels,
    className,
    fullWidth = false,
    isAuthenticated,
    orientation = "row",
}) {
    const layoutClassName =
        orientation === "column"
            ? "flex flex-col gap-3 sm:flex-row"
            : "flex flex-wrap items-center gap-3";
    const buttonClassName = fullWidth ? "w-full sm:w-auto" : undefined;

    return (
        <div className={`${layoutClassName} ${className ?? ""}`.trim()}>
            {isAuthenticated ? (
                <>
                    <Button
                        className={buttonClassName}
                        nativeButton={false}
                        render={<Link href="/app" />}
                    >
                        {authLabels.go_to_app}
                    </Button>
                    <form action={signOutAction} className={buttonClassName}>
                        <Button className={buttonClassName} type="submit" variant="outline">
                            {authLabels.sign_out}
                        </Button>
                    </form>
                </>
            ) : (
                <>
                    <Button
                        className={buttonClassName}
                        nativeButton={false}
                        render={<Link href="/signup" />}
                    >
                        {authLabels.sign_up}
                    </Button>
                    <Button
                        className={buttonClassName}
                        nativeButton={false}
                        render={<Link href="/signin" />}
                        variant="outline"
                    >
                        {authLabels.sign_in}
                    </Button>
                </>
            )}
        </div>
    );
}

function SectionHeading({ description, title }) {
    return (
        <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
        </div>
    );
}

function LandingFeatureCard({ description, icon: Icon, title }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col gap-4">
                <div className="bg-muted flex size-11 items-center justify-center rounded-lg border">
                    <Icon />
                </div>
                <div className="flex flex-col gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}

function LandingStepCard({ description, icon: Icon, index, title }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="bg-muted flex size-11 items-center justify-center rounded-lg border">
                        <Icon />
                    </div>
                    <Badge variant="outline">{String(index + 1).padStart(2, "0")}</Badge>
                </div>
                <div className="flex flex-col gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}

function HeroPanel({ landing }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-muted flex size-16 items-center justify-center rounded-xl border p-3">
                        <Image
                            src={SiteConfig.appIcon}
                            alt={SiteConfig.title}
                            width={64}
                            height={64}
                            className="size-10 object-contain"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <CardTitle>{landing.hero.card_title}</CardTitle>
                        <CardDescription>{landing.hero.card_description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {landing.proofs.map(proof => (
                        <Badge key={proof.id} variant="secondary">
                            {proof.label}
                        </Badge>
                    ))}
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                    {landing.hero.panel_points.map(point => (
                        <div key={point} className="flex items-start gap-3 text-sm">
                            <div className="bg-muted mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border">
                                <ShieldCheck />
                            </div>
                            <p className="text-muted-foreground">{point}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function LandingPage({ authLabels, currentLocale, isAuthenticated, landing }) {
    return (
        <div className="bg-background min-h-screen">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 sm:py-6 lg:gap-10 lg:px-8 lg:py-8">
                <header className="bg-card flex flex-col gap-4 rounded-xl border px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted flex size-11 items-center justify-center rounded-lg border p-2">
                            <Image
                                src={SiteConfig.appIcon}
                                alt={SiteConfig.title}
                                width={44}
                                height={44}
                                className="size-7 object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">{SiteConfig.title}</span>
                            <span className="text-muted-foreground text-sm">
                                {landing.hero.eyebrow}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <LocalizationButton currentLocale={currentLocale} />
                        <AnimatedThemeToggler />
                        <LandingAuthActions
                            authLabels={authLabels}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                </header>

                <main className="flex flex-1 flex-col gap-10 pb-6 sm:gap-12">
                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
                        <div className="flex flex-col gap-6">
                            <Badge variant="outline">{landing.hero.eyebrow}</Badge>
                            <div className="flex max-w-3xl flex-col gap-4">
                                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                    {landing.hero.title}
                                </h1>
                                <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
                                    {landing.hero.description}
                                </p>
                            </div>
                            <LandingAuthActions
                                authLabels={authLabels}
                                fullWidth
                                isAuthenticated={isAuthenticated}
                                orientation="column"
                            />
                        </div>
                        <HeroPanel landing={landing} />
                    </section>

                    <section className="flex flex-col gap-4">
                        <p className="text-muted-foreground text-sm font-medium">
                            {landing.proofs_title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {landing.proofs.map(proof => (
                                <Badge key={proof.id} variant="secondary">
                                    {proof.label}
                                </Badge>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    <section className="flex flex-col gap-6">
                        <SectionHeading
                            description={landing.benefits_description}
                            title={landing.benefits_title}
                        />
                        <div className="grid gap-4 md:grid-cols-3">
                            {landing.benefits.map(item => {
                                const Icon = BENEFIT_ICONS[item.id] ?? ShieldCheck;

                                return (
                                    <LandingFeatureCard
                                        key={item.id}
                                        description={item.description}
                                        icon={Icon}
                                        title={item.title}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-start">
                        <SectionHeading
                            description={landing.steps_description}
                            title={landing.steps_title}
                        />
                        <div className="grid gap-4 md:grid-cols-3">
                            {landing.steps.map((item, index) => {
                                const Icon = STEP_ICONS[item.id] ?? BookOpen;

                                return (
                                    <LandingStepCard
                                        key={item.id}
                                        description={item.description}
                                        icon={Icon}
                                        index={index}
                                        title={item.title}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    <Separator />

                    <section className="flex flex-col gap-6">
                        <SectionHeading
                            description={landing.features_description}
                            title={landing.features_title}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            {landing.features.map(item => {
                                const Icon = FEATURE_ICONS[item.id] ?? ClipboardList;

                                return (
                                    <LandingFeatureCard
                                        key={item.id}
                                        description={item.description}
                                        icon={Icon}
                                        title={item.title}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    <Card>
                        <CardHeader className="flex flex-col gap-3">
                            <CardTitle className="text-2xl">{landing.cta.title}</CardTitle>
                            <CardDescription className="text-base">
                                {landing.cta.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LandingAuthActions
                                authLabels={authLabels}
                                fullWidth
                                isAuthenticated={isAuthenticated}
                                orientation="column"
                            />
                        </CardContent>
                    </Card>
                </main>

                <footer className="flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted flex size-10 items-center justify-center rounded-lg border p-2">
                                <Image
                                    src={SiteConfig.appIcon}
                                    alt={SiteConfig.title}
                                    width={40}
                                    height={40}
                                    className="size-6 object-contain"
                                />
                            </div>
                            <span className="font-semibold">{SiteConfig.title}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {landing.footer.description}
                        </p>
                        <p className="text-muted-foreground text-sm">{landing.footer.note}</p>
                        <p className="text-muted-foreground text-xs">
                            © {new Date().getFullYear()} {SiteConfig.team.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LocalizationButton currentLocale={currentLocale} size={18} />
                        <AnimatedThemeToggler size={18} />
                    </div>
                </footer>
            </div>
        </div>
    );
}
