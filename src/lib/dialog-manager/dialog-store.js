"use client";
import { toast } from "sonner";
import { create } from "zustand";

import { DialogFactory } from "./dialog-factory";

export const useDialogStore = create(set => ({
    dialogs: [],
    activeDialog: null,

    addDialog: config => {
        const dialog = DialogFactory.fromConfig(config);

        set(state => ({
            dialogs: [...state.dialogs, dialog],
            activeDialog: state.activeDialog ?? dialog,
        }));

        return dialog.id;
    },

    removeDialog: id =>
        set(state => {
            const dialogs = state.dialogs.filter(d => d.id !== id);
            return {
                dialogs,
                activeDialog: dialogs[0] ?? null,
            };
        }),

    setLoading: (id, loading) =>
        set(state => ({
            dialogs: state.dialogs.map(d => (d.id === id ? { ...d, loading } : d)),
            activeDialog:
                state.activeDialog?.id === id
                    ? { ...state.activeDialog, loading }
                    : state.activeDialog,
        })),

    clear: () => set({ dialogs: [], activeDialog: null }),
}));

export async function handleDialogAction(dialogId, action) {
    const { setLoading, removeDialog } = useDialogStore.getState();

    try {
        setLoading(dialogId, true);

        const result = action();

        if (result instanceof Promise) {
            await result;
        }

        removeDialog(dialogId);
    } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");

        toast.error("Action failed", {
            description: err.message,
        });

        setLoading(dialogId, false);
    }
}
