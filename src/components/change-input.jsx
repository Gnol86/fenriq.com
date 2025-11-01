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
    ...props
}) {
    const [changeMode, setChangeMode] = useState(false);
    const containerRef = useRef(null);
    const initialValueRef = useRef(value);

    useEffect(() => {
        if (isSuccess === true) {
            setChangeMode(false);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (changeMode && containerRef.current) {
            const input = containerRef.current.querySelector("input");
            input?.focus();
        }
    }, [changeMode]);

    const handleOpenChangeMode = () => {
        initialValueRef.current = value;
        setChangeMode(true);
    };

    const handleBlur = () => {
        // Fermer seulement si la valeur n'a pas été modifiée
        if (value === initialValueRef.current) {
            setChangeMode(false);
        }
    };

    const handleCancel = e => {
        e.stopPropagation();
        // Remettre la valeur initiale et fermer
        props.onChange?.(initialValueRef.current);
        setChangeMode(false);
    };

    return (
        <div className="group flex cursor-pointer flex-col gap-1">
            <FormLabel>{label}</FormLabel>
            {changeMode ? (
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
                        {icon && (
                            <InputGroupAddon>{icon && icon}</InputGroupAddon>
                        )}
                        <InputGroupInput
                            disabled={loading}
                            value={value}
                            {...props}
                        />
                        <InputGroupAddon align="inline-end">
                            {loading ? (
                                <Spinner />
                            ) : value !== initialValueRef.current ? (
                                <>
                                    <InputGroupButton
                                        type="button"
                                        onClick={handleCancel}
                                    >
                                        <X className="text-destructive" />
                                    </InputGroupButton>
                                    <InputGroupButton
                                        disabled={loading}
                                        type="submit"
                                    >
                                        <Check className="text-green-600" />
                                    </InputGroupButton>
                                </>
                            ) : (
                                <InputGroupButton
                                    type="button"
                                    onClick={handleCancel}
                                >
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
                    <Edit
                        size={12}
                        className="opacity-0 group-hover:opacity-50"
                    />
                </button>
            )}
        </div>
    );
}
