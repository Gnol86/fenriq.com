"use client";

import { Check, ChevronLeft, ChevronRight, Ellipsis, Hash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, createUrlSearchParams } from "@/lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

const EMPTY_SEARCH_PARAMS = {};

export function Pagination({ totalPages, page, searchParams = EMPTY_SEARCH_PARAMS }) {
    const router = useRouter();
    const pathname = usePathname();

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name, value) => {
            const params = createUrlSearchParams(searchParams);
            params.set(name, String(value));

            return params.toString();
        },
        [searchParams]
    );

    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="flex w-full justify-center">
            <ButtonGroup>
                <ButtonGroup>
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        disabled={page === 1}
                        onClick={() => {
                            router.replace(`${pathname}?${createQueryString("page", page - 1)}`);
                        }}
                    >
                        <ChevronLeft />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="secondary" size="icon-sm" />}>
                            <Hash className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top">
                            <ScrollArea className="h-48 pr-3">
                                {Array.from({ length: Number(totalPages) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <DropdownMenuItem
                                            className="flex justify-between"
                                            key={p}
                                            onClick={() => {
                                                router.replace(
                                                    `${pathname}?${createQueryString("page", p)}`
                                                );
                                            }}
                                        >
                                            {p}
                                            {p === page && <Check />}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        disabled={page === totalPages}
                        onClick={() => {
                            router.replace(`${pathname}?${createQueryString("page", page + 1)}`);
                        }}
                    >
                        <ChevronRight />
                    </Button>
                </ButtonGroup>
                <ButtonGroup>
                    <Button
                        variant={cn(page === 1 ? "default" : "secondary")}
                        size="icon-sm"
                        onClick={() => {
                            router.replace(`${pathname}?${createQueryString("page", 1)}`);
                        }}
                    >
                        1
                    </Button>

                    {(() => {
                        const elems = [];
                        const tp = Number(totalPages);
                        const p = Number(page);

                        if (tp <= 1) {
                            return null;
                        }

                        // For larger totals, show up to 3 middle pages around current page
                        const start = Math.max(2, Math.min(p - 1, tp - 3));
                        const end = Math.min(tp - 1, start + 2);
                        const middlePages = Array.from(
                            { length: Math.max(end - start + 1, 0) },
                            (_, pageIndex) => start + pageIndex
                        );

                        if (start > 2) {
                            elems.push(
                                <Button key="ellipsis-start" variant="secondary" size="icon-sm">
                                    <Ellipsis />
                                </Button>
                            );
                        }

                        for (const pageNumber of middlePages) {
                            elems.push(
                                <Button
                                    key={pageNumber}
                                    size="icon-sm"
                                    variant={cn(page === pageNumber ? "default" : "secondary")}
                                    onClick={() => {
                                        router.replace(
                                            `${pathname}?${createQueryString("page", pageNumber)}`
                                        );
                                    }}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        }

                        if (end < tp - 1) {
                            elems.push(
                                <Button key="ellipsis-end" variant="secondary" size="icon-sm">
                                    <Ellipsis />
                                </Button>
                            );
                        }

                        return elems;
                    })()}

                    {totalPages > 1 && (
                        <Button
                            variant={cn(page === totalPages ? "default" : "secondary")}
                            size="icon-sm"
                            onClick={() => {
                                router.replace(
                                    `${pathname}?${createQueryString("page", totalPages)}`
                                );
                            }}
                        >
                            {totalPages}
                        </Button>
                    )}
                </ButtonGroup>
            </ButtonGroup>
        </div>
    );
}
