"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function getActionErrorMessage(err, fallbackMessage = null) {
    if (err?.message) {
        const apiErrorMatch = err.message.match(/\[Error \[APIError\]: (.*?)\]/);
        if (apiErrorMatch) {
            return apiErrorMatch[1];
        }

        return err.message;
    }

    return fallbackMessage ?? "Une erreur s'est produite";
}

export function useServerAction() {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const router = useRouter();

    const execute = useCallback(
        async (action, options = {}) => {
            const {
                loadingMessage = "Opération en cours...",
                successMessage = null,
                errorMessage = null,
                refreshOnSuccess = true,
                redirectOnSuccess = null,
            } = options;

            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);
            setError(null);
            setData(null);

            const toastId = toast.loading(loadingMessage);

            try {
                const actionData = await action();

                setData(actionData);
                setIsSuccess(true);
                setIsPending(false);

                if (successMessage) {
                    toast.success(successMessage, {
                        id: toastId,
                    });
                } else {
                    toast.dismiss(toastId);
                }

                if (redirectOnSuccess) {
                    router.push(redirectOnSuccess);
                }
                if (refreshOnSuccess) {
                    router.refresh();
                }

                return {
                    success: true,
                    data: actionData,
                    error: null,
                };
            } catch (err) {
                console.error("Server action error:", err);

                const resolvedErrorMessage = getActionErrorMessage(err, errorMessage);

                setError(err);
                setIsError(true);
                setIsPending(false);

                toast.error(resolvedErrorMessage, {
                    id: toastId,
                });

                return {
                    success: false,
                    data: null,
                    error: err,
                };
            }
        },
        [router]
    );

    const reset = useCallback(() => {
        setIsPending(false);
        setIsSuccess(false);
        setIsError(false);
        setError(null);
        setData(null);
    }, []);

    return {
        execute,
        reset,
        isPending,
        isSuccess,
        isError,
        error,
        data,
    };
}
