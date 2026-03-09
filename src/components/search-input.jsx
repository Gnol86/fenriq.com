"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { createUrlSearchParams } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Spinner } from "./ui/spinner";

const EMPTY_SEARCH_PARAMS = {};

export default function SearchInput({
    placeholder = "Search...",
    searchParam = "search",
    debounceMs = 300,
    initialValue = "",
    searchParams = EMPTY_SEARCH_PARAMS,
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const debouncedSearch = useDebouncedCallback((value, currentSearchParams) => {
        const params = createUrlSearchParams(currentSearchParams);

        if (value.trim()) {
            params.set(searchParam, value.trim());
        } else {
            params.delete(searchParam);
        }

        // Reset pagination when searching
        params.delete("page");

        startTransition(() => {
            const query = params.toString();
            router.replace(`${pathname}${query ? `?${query}` : ""}`);
        });
    }, debounceMs);

    const handleInputChange = e => {
        debouncedSearch(e.target.value, searchParams);
    };

    return (
        <InputGroup>
            <InputGroupAddon>{isPending ? <Spinner /> : <Search />}</InputGroupAddon>
            <InputGroupInput
                key={`${searchParam}:${initialValue}`}
                type="text"
                placeholder={placeholder}
                defaultValue={initialValue}
                onChange={handleInputChange}
                disabled={isPending}
            />
        </InputGroup>
    );
}
