"use client";

import { dialogManager } from "@/lib/dialog-manager/dialog-manager";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

export default function TestDialog() {
    const handleTest1 = () => {
        dialogManager.confirm({
            title: "Delete Item",
            description: "Are you sure you want to delete this item?",
            action: {
                label: "Delete",
                variant: "destructive",
                onClick: async () => {
                    await deleteItem();
                },
            },
        });
    };
    const handleTest2 = () => {
        dialogManager.confirm({
            title: "Delete Account",
            description: "This action is irreversible. All your data will be permanently deleted.",
            confirmText: "DELETE",
            action: {
                label: "Delete Account",
                variant: "destructive",
                onClick: async () => {
                    await deleteAccount();
                },
            },
        });
    };
    const handleTest3 = () => {
        dialogManager.input({
            title: "Create Project",
            description: "Enter a name for your new project.",
            input: {
                label: "Project Name",
                placeholder: "My awesome project",
            },
            action: {
                label: "Create",
                onClick: async projectName => {
                    await createProject(projectName);
                },
            },
        });
    };
    const handleTest4 = () => {
        dialogManager.input({
            title: "Rename File",
            description: "Enter a new name for this file.",
            input: {
                label: "Filename",
                placeholder: "document.pdf",
                defaultValue: "currentFilename",
            },
            action: {
                label: "Rename",
                onClick: async filename => {
                    if (!filename?.trim()) {
                        throw new Error("Filename cannot be empty");
                    }

                    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
                        throw new Error("Invalid filename format");
                    }
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    await renameFile(filename);
                },
            },
        });
    };
    return (
        <div>
            <ButtonGroup>
                <Button onClick={handleTest1} variant="destructive">
                    Test1
                </Button>
                <Button onClick={handleTest2} variant="destructive">
                    Test2
                </Button>
                <Button onClick={handleTest3} variant="destructive">
                    Test3
                </Button>
                <Button onClick={handleTest4} variant="destructive">
                    Test4
                </Button>
            </ButtonGroup>
        </div>
    );
}
