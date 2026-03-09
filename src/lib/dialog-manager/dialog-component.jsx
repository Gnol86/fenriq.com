"use client";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";
import { cn, normalizeText } from "@/lib/utils";
import { useDialogStore } from "./dialog-store";

export function DialogComponent(props) {
    const { dialog } = props;
    const t = useTranslations("common.dialog");
    const { execute, isPending } = useServerAction();
    const removeDialog = useDialogStore(state => state.removeDialog);
    const setLoading = useDialogStore(state => state.setLoading);
    const [confirmText, setConfirmText] = useState("");
    const [inputValue, setInputValue] = useState(
        dialog.type === "input" ? (dialog.input.defaultValue ?? "") : ""
    );
    const confirmInputRef = useRef(null);
    const textInputRef = useRef(null);

    // Synchronize isPending state with dialog store
    useEffect(() => {
        setLoading(dialog.id, isPending);
    }, [isPending, dialog.id, setLoading]);

    useEffect(() => {
        if (dialog.type === "confirm" && dialog.confirmText) {
            confirmInputRef.current?.focus();
        }

        if (dialog.type === "input") {
            textInputRef.current?.focus();
        }
    }, [dialog.type, dialog.confirmText]);

    if (dialog.type === "custom") {
        return (
            <Modal open={true}>
                <ModalContent>{dialog.children}</ModalContent>
            </Modal>
        );
    }

    const isConfirmDisabled =
        dialog.type === "confirm" && dialog.confirmText
            ? normalizeText(confirmText) !== normalizeText(dialog.confirmText)
            : false;

    const handleAction = async () => {
        await execute(
            async () => {
                const result = await dialog.action.onClick?.(
                    dialog.type === "input" ? inputValue : undefined
                );
                // Remove dialog on success
                removeDialog(dialog.id);
                return result;
            },
            {
                successMessage: dialog.action.successMessage,
                refreshOnSuccess: true,
                redirectOnSuccess: dialog.action.redirectOnSuccess,
            }
        );
    };

    const handleCancel = async () => {
        if (dialog.cancel?.onClick) {
            await dialog.cancel.onClick();
        } else {
            removeDialog(dialog.id);
        }
    };

    return (
        <Modal
            open={true}
            onOpenChange={open => {
                if (!open && dialog.loading) return;
                handleCancel();
            }}
            dismissible={!dialog.loading}
        >
            <ModalContent>
                <ModalHeader
                    className={cn({
                        "flex flex-col items-center gap-2": dialog.style === "centered",
                    })}
                >
                    {dialog.icon && (
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            <dialog.icon className="size-6" />
                        </div>
                    )}
                    <ModalTitle>{dialog.title ?? ""}</ModalTitle>
                    {typeof dialog.description === "string" ? (
                        <ModalDescription>{dialog.description}</ModalDescription>
                    ) : (
                        dialog.description
                    )}
                </ModalHeader>

                {dialog.type === "confirm" && dialog.confirmText && (
                    <div className="space-y-2 text-sm">
                        <p>
                            {t.rich("type_to_confirm", {
                                text: dialog.confirmText,
                                code: chunks => (
                                    <code className="font-mono bg-muted text-muted-foreground rounded-sm border border-muted-foreground/50 px-1">
                                        {chunks}
                                    </code>
                                ),
                            })}
                        </p>
                        <Input
                            ref={confirmInputRef}
                            value={confirmText}
                            onChange={e => setConfirmText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    if (!dialog.loading && !isConfirmDisabled) {
                                        void handleAction();
                                    }
                                }
                            }}
                        />
                    </div>
                )}

                {dialog.type === "input" && (
                    <div className="mt-2">
                        <Label>{dialog.input.label}</Label>
                        <Input
                            ref={textInputRef}
                            value={inputValue}
                            placeholder={dialog.input.placeholder}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!dialog.loading && !isConfirmDisabled) {
                                        void handleAction();
                                    }
                                }
                            }}
                        />
                    </div>
                )}

                <ModalFooter>
                    <Button variant="outline" disabled={dialog.loading} onClick={handleCancel}>
                        {dialog.cancel?.label ?? t("cancel")}
                    </Button>

                    <Button
                        disabled={dialog.loading || isConfirmDisabled}
                        onClick={handleAction}
                        variant={dialog.action.variant ?? "default"}
                    >
                        {dialog.action.label ?? t("confirm")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
