import { useDialogStore } from "./dialog-store";

export const dialogManager = {
    confirm: config => useDialogStore.getState().addDialog({ ...config, type: "confirm" }),

    input: config => useDialogStore.getState().addDialog({ ...config, type: "input" }),

    custom: config => useDialogStore.getState().addDialog({ ...config, type: "custom" }),

    close: id => useDialogStore.getState().removeDialog(id),

    closeAll: () => useDialogStore.getState().clear(),
};
