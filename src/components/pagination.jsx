"use client";

import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";

export function Pagination({ totalPages, page }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams);
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    return (
        <div className="w-full flex justify-center items-center gap-2">
            <Button
                variant={cn(page == 1 ? "default" : "secondary")}
                size="icon"
                onClick={() => {
                    router.push(pathname + "?" + createQueryString("page", 1));
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

                if (start > 2) {
                    elems.push(<Ellipsis key="ellipsis-start" size={16} />);
                }

                for (let i = start; i <= end; i++) {
                    elems.push(
                        <Button
                            key={i}
                            size="icon"
                            variant={cn(page == i ? "default" : "secondary")}
                            onClick={() => {
                                router.push(
                                    pathname +
                                        "?" +
                                        createQueryString("page", i)
                                );
                            }}
                        >
                            {i}
                        </Button>
                    );
                }

                if (end < tp - 1) {
                    elems.push(<Ellipsis key="ellipsis-end" size={16} />);
                }

                return elems;
            })()}

            {totalPages > 1 && (
                <Button
                    variant={cn(page == totalPages ? "default" : "secondary")}
                    size="icon"
                    onClick={() => {
                        router.push(
                            pathname +
                                "?" +
                                createQueryString("page", totalPages)
                        );
                    }}
                >
                    {totalPages}
                </Button>
            )}
            {totalPages > 5 && (
                <Select
                    value={String(page)}
                    onValueChange={value => {
                        router.push(
                            pathname + "?" + createQueryString("page", value)
                        );
                    }}
                >
                    <SelectTrigger className="w-9 flex justify-center">
                        {/* <SelectValue>{page}</SelectValue>*/}
                    </SelectTrigger>
                    <SelectContent className="min-w-9">
                        <ScrollArea className="h-48 pr-3">
                            {Array.from(
                                { length: Number(totalPages) },
                                (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <SelectItem
                                            key={p}
                                            value={p.toString()}
                                        >
                                            {p}
                                        </SelectItem>
                                    );
                                }
                            )}
                        </ScrollArea>
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
