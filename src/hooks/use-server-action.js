"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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
                successMessage = null,
                refreshOnSuccess = true,
                redirectOnSuccess = null,
            } = options;

            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);
            setError(null);
            setData(null);

            return toast.promise(action(), {
                loading: "Opération en cours...",
                success: data => {
                    setData(data);

                    setIsSuccess(true);
                    setIsPending(false);

                    return successMessage;
                },
                error: err => {
                    console.error("Server action error:", err);

                    // Extract error message
                    let errorMessage = "Une erreur s'est produite";

                    if (err?.message) {
                        // Check if it's a Better-Auth APIError format
                        const apiErrorMatch = err.message.match(/\[Error \[APIError\]: (.*?)\]/);
                        if (apiErrorMatch) {
                            errorMessage = apiErrorMatch[1];
                        } else {
                            errorMessage = err.message;
                        }
                    }

                    setError(err);
                    setIsError(true);
                    setIsPending(false);

                    return errorMessage;
                },
                finally: () => {
                    // Push first, then refresh to ensure data is updated on the new page
                    if (redirectOnSuccess) {
                        router.push(redirectOnSuccess);
                    }
                    if (refreshOnSuccess) {
                        router.refresh();
                    }
                },
            });
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
