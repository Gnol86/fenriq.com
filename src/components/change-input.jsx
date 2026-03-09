"use client";

import { Check, Edit, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { FormDescription, FormLabel, FormMessage } from "./ui/form";

export default function ChangeInput({
    label,
    icon,
    description,
    loading,
    isSuccess,
    value,
    onEditStart,
    ...props
}) {
    const [changeMode, setChangeMode] = useState(false);
    const [initialValue, setInitialValue] = useState("");
    const containerRef = useRef(null);
    const isEditing = changeMode && !isSuccess;

    useEffect(() => {
        if (isEditing && containerRef.current) {
            const input = containerRef.current.querySelector("input");
            input?.focus();
        }
    }, [isEditing]);

    const handleOpenChangeMode = () => {
        onEditStart?.();
        setInitialValue(value);
        setChangeMode(true);
    };

    const handleBlur = () => {
        // Fermer seulement si la valeur n'a pas été modifiée
        if (value === initialValue) {
            setChangeMode(false);
        }
    };

    const handleCancel = e => {
        e.stopPropagation();
        // Remettre la valeur initiale et fermer
        props.onChange?.(initialValue);
        setChangeMode(false);
    };

    return (
        <div className="group flex cursor-pointer flex-col gap-1">
            <FormLabel>{label}</FormLabel>
            {isEditing ? (
                // biome-ignore lint/a11y/noStaticElementInteractions: role="presentation" indicates this is not an interactive element, events are for propagation control only
                <div
                    role="presentation"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                        if (e.key === "Escape") {
                            e.stopPropagation();
                        }
                    }}
                >
                    <InputGroup ref={containerRef} onBlur={handleBlur}>
                        {icon && <InputGroupAddon>{icon && icon}</InputGroupAddon>}
                        <InputGroupInput disabled={loading} value={value} {...props} />
                        <InputGroupAddon align="inline-end">
                            {loading ? (
                                <Spinner />
                            ) : value !== initialValue ? (
                                <>
                                    <InputGroupButton type="button" onClick={handleCancel}>
                                        <X className="text-destructive" />
                                    </InputGroupButton>
                                    <InputGroupButton disabled={loading} type="submit">
                                        <Check className="text-green-600" />
                                    </InputGroupButton>
                                </>
                            ) : (
                                <InputGroupButton type="button" onClick={handleCancel}>
                                    <X />
                                </InputGroupButton>
                            )}
                        </InputGroupAddon>
                    </InputGroup>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </div>
            ) : (
                <button
                    type="button"
                    className="group flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-inherit"
                    onClick={handleOpenChangeMode}
                >
                    <span>{value}</span>
                    <Edit size={12} className="opacity-0 group-hover:opacity-50" />
                </button>
            )}
        </div>
    );
}
