import { SortParams } from "@/client/types.gen";
import { SortingState } from "@tanstack/react-table";

export const cleanEmptyParams = <T extends Record<string, unknown>>(
    search: T
) => {
    const newSearch = { ...search };
    Object.keys(newSearch).forEach((key) => {
        const value = newSearch[key];
        if (
            value === undefined ||
            value === "" ||
            (typeof value === "number" && isNaN(value))
        )
            delete newSearch[key];
    });

    // if (search.pageIndex === DEFAULT_PAGE_INDEX) delete newSearch.pageIndex;
    // if (search.pageSize === DEFAULT_PAGE_SIZE) delete newSearch.pageSize;

    return newSearch;
};

export const stateToSortFilterParam = (sorting: SortingState | undefined) => {
    if (!sorting || sorting.length == 0) return undefined;

    const sort = sorting[0];

    return `${sort.desc ? "-" : ""}${sort.id}` as const;
}


export const stateToSortBy = (sorting: SortingState | undefined) => {
    if (!sorting || sorting.length == 0) return undefined;

    const sort = sorting[0];

    return `${sort.id}.${sort.desc ? "desc" : "asc"}` as const;
};

export const sortByToState = (sortBy: SortParams["sortBy"] | undefined) => {
    if (!sortBy) return [];

    const [id, desc] = sortBy.split(".");
    return [{ id, desc: desc === "desc" }];
};