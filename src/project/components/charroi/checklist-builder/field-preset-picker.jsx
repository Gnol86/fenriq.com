"use client";

import { FIELD_PRESETS } from "@project/lib/charroi/checklist-builder-defaults";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FieldPresetPicker({ disabled, onPick, title }) {
    const stopPropagation = event => {
        event.stopPropagation();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        onClick={stopPropagation}
                        onKeyDown={stopPropagation}
                        onPointerDown={stopPropagation}
                    />
                }
            >
                {title}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {FIELD_PRESETS.map(preset => (
                    <DropdownMenuItem
                        key={preset.id}
                        disabled={disabled}
                        onClick={event => {
                            event.stopPropagation();
                            onPick(preset.factory());
                        }}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span>{preset.label}</span>
                            <span className="text-muted-foreground text-xs">
                                {preset.description}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
