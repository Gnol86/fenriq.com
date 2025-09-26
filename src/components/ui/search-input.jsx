"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput({
    placeholder = "Rechercher...",
    searchParam = "search",
    debounceMs = 300,
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(() => {
        return searchParams.get(searchParam) ?? "";
    });

    const debouncedSearch = useDebouncedCallback(value => {
        const params = new URLSearchParams(searchParams.toString());

        if (value.trim()) {
            params.set(searchParam, value.trim());
        } else {
            params.delete(searchParam);
        }

        // Reset pagination when searching
        params.delete("page");

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }, debounceMs);

    const handleInputChange = e => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    // Sync with URL changes (e.g., when navigating back/forward)
    useEffect(() => {
        const urlSearchValue = searchParams.get(searchParam) ?? "";
        setSearchValue(urlSearchValue);
    }, [searchParams, searchParam]);

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleInputChange}
                className="pl-9"
                disabled={isPending}
            />
        </div>
    );
}
