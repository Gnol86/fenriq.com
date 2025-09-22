"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useServerAction() {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingExecution, setPendingExecution] = useState(null);
    const router = useRouter();

    const executeAction = useCallback(
        async (action, options = {}) => {
            const {
                loadingMessage = "En cours...",
                successMessage = "Opération réussie",
                errorMessage = "Une erreur s'est produite",
                showToast = true,
                refreshOnSuccess = true,
                redirectOnSuccess = null,
            } = options;

            setIsError(false);
            setIsSuccess(false);
            setError(null);
            setData(null);

            try {
                if (showToast) {
                    toast.loading(loadingMessage);
                }

                const result = await action();

                // Si la server action retourne un objet avec success/message
                if (
                    result &&
                    typeof result === "object" &&
                    "success" in result
                ) {
                    if (result.success) {
                        setData(result);
                        setIsSuccess(true);
                        if (showToast) {
                            toast.dismiss();
                            toast.success(result.message || successMessage);
                        }
                        if (redirectOnSuccess) {
                            router.push(redirectOnSuccess);
                        } else if (refreshOnSuccess) {
                            router.refresh();
                        }
                        return result;
                    } else {
                        throw new Error(result.message || errorMessage);
                    }
                }

                setData(result);
                setIsSuccess(true);
                if (showToast) {
                    toast.dismiss();
                    toast.success(successMessage);
                }
                if (redirectOnSuccess) {
                    router.push(redirectOnSuccess);
                } else if (refreshOnSuccess) {
                    router.refresh();
                }
                return result;
            } catch (err) {
                console.error("Server action error:", err);
                setError(err);
                setIsError(true);
                if (showToast) {
                    toast.dismiss();
                    toast.error(err?.message || errorMessage);
                }
                throw err;
            } finally {
                setIsPending(false);
            }
        },
        [router]
    );

    const execute = useCallback(
        async (
            action,
            {
                loadingMessage = "En cours...",
                successMessage = "Opération réussie",
                errorMessage = "Une erreur s'est produite",
                showToast = true,
                refreshOnSuccess = true,
                redirectOnSuccess = null,
                confirmationMessage = null,
            } = {}
        ) => {
            // Vérifier la confirmation si nécessaire
            if (confirmationMessage) {
                return new Promise((resolve, reject) => {
                    setPendingExecution({
                        action,
                        options: arguments[1],
                        resolve,
                        reject,
                    });
                    setShowConfirmDialog(true);
                });
            }

            return executeAction(action, arguments[1]);
        },
        [executeAction]
    );

    const handleConfirm = useCallback(() => {
        setShowConfirmDialog(false);
        if (pendingExecution) {
            const { action, options, resolve, reject } = pendingExecution;
            executeAction(action, options).then(resolve).catch(reject);
            setPendingExecution(null);
        }
    }, [pendingExecution, executeAction]);

    const handleCancel = useCallback(() => {
        setShowConfirmDialog(false);
        if (pendingExecution) {
            pendingExecution.resolve(null);
            setPendingExecution(null);
        }
    }, [pendingExecution]);

    const reset = useCallback(() => {
        setIsPending(false);
        setIsSuccess(false);
        setIsError(false);
        setError(null);
        setData(null);
        setShowConfirmDialog(false);
        setPendingExecution(null);
    }, []);

    return {
        execute,
        reset,
        isPending,
        isSuccess,
        isError,
        error,
        data,
        showConfirmDialog,
        confirmationMessage: pendingExecution?.options?.confirmationMessage,
        handleConfirm,
        handleCancel,
    };
}
