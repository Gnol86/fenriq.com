"use client";

import { setLocaleAction } from "@/actions/locale.action";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Globe } from "lucide-react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useServerAction } from "../hooks/use-server-action";
import { flagId, localeNames } from "../lib/i18n/config";
import { Button } from "./ui/button";

export default function SelectLanguageDialog({ hasLocale = true }) {
    const { execute, isPending } = useServerAction();
    const [open, setOpen] = useState(!hasLocale);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={e => e.preventDefault()}
                onPointerDownOutside={e => e.preventDefault()}
                onInteractOutside={e => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        <Globe />
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(localeNames).map(([locale, name]) => (
                        <Button
                            key={locale}
                            variant="outline"
                            onClick={async () => {
                                if (isPending) return;

                                await execute(
                                    () => setLocaleAction({ locale }),
                                    {
                                        successMessage: `${localeNames[locale]}`,
                                        refreshOnSuccess: true,
                                    }
                                );

                                setOpen(false);
                            }}
                        >
                            <ReactCountryFlag
                                svg
                                countryCode={flagId[locale] ?? locale}
                            />
                            <span>{name}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
