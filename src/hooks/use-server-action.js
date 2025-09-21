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
    const router = useRouter();

    const execute = useCallback(
        async (
            action,
            {
                loadingMessage = "En cours...",
                successMessage = "Opération réussie",
                errorMessage = "Une erreur s'est produite",
                showToast = true,
                refreshOnSuccess = true,
            } = {}
        ) => {
            setIsPending(true);
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
                if (result && typeof result === "object" && "success" in result) {
                    if (result.success) {
                        setData(result);
                        setIsSuccess(true);
                        if (showToast) {
                            toast.dismiss();
                            toast.success(result.message || successMessage);
                        }
                        if (refreshOnSuccess) {
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
                if (refreshOnSuccess) {
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