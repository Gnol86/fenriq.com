"use client";

import { useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";

function transformToStyle(transform, transition) {
    if (!transform) {
        return {
            transition,
        };
    }

    return {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
    };
}

export function SortableBlock({ children, id, isSelected = false, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });
    const className = `rounded-lg border bg-background ${isSelected ? "ring-2 ring-ring" : ""} ${
        isDragging ? "opacity-70" : ""
    }`;
    const style = transformToStyle(transform, transition);

    if (onClick) {
        return (
            // biome-ignore lint/a11y/useSemanticElements: dnd container wraps nested interactive controls and cannot be a button element.
            <div
                ref={setNodeRef}
                style={style}
                role="button"
                tabIndex={0}
                className={className}
                onClick={onClick}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClick(event);
                    }
                }}
            >
                {children({ attributes, listeners })}
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className={className}>
            {children({ attributes, listeners })}
        </div>
    );
}

export function SortableHandle({ attributes, listeners }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <span className="sr-only">Réordonner</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
            >
                <path d="M10 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM10 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM10 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
        </Button>
    );
}
