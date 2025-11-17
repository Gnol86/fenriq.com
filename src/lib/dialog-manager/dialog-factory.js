function generateDialogId() {
    return Math.random().toString(36).slice(2, 9);
}

export const DialogFactory = {
    confirm: config => ({
        ...config,
        type: "confirm",
        id: generateDialogId(),
        loading: false,
    }),

    input: config => ({
        ...config,
        type: "input",
        id: generateDialogId(),
        loading: false,
    }),

    custom: config => ({
        ...config,
        type: "custom",
        id: generateDialogId(),
        loading: false,
    }),

    fromConfig: config => {
        const id = generateDialogId();

        switch (config.type) {
            case "confirm":
                return {
                    ...config,
                    id,
                    loading: false,
                };
            case "input":
                return {
                    ...config,
                    id,
                    loading: false,
                };
            case "custom":
                return {
                    ...config,
                    id,
                    loading: false,
                };
            default:
                throw new Error(`Unknown dialog type`);
        }
    },
};
