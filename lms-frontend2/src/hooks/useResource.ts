// hooks/useResourceTable.ts
import { simpleRequest } from "@/client/core/simpleRequest";
import { ItemsFiltersState, MakeColumnsFn, PaginatedData } from "@/client/types.gen";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { sortByToState, stateToSortFilterParam } from "@/utils/table/table";
import { useQuery } from "@tanstack/react-query";
import { RegisteredRouter, RouteIds } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

/* ------------------ */

interface UseResourceTableOptions<T> {
    endpoint: string;
    routeId: RouteIds<RegisteredRouter["routeTree"]> | null;
    makeColumns: MakeColumnsFn<T>;
    parseUrlFilters?: (filters: Record<string, any>) => Record<string, any>;
    parseReponseData?: (response: any) => Array<T>;
    parseFiltersToParams?: (filters: Record<string, any>, params?: Record<string, any>) => Record<string, any>;
    disablePagination?: boolean;
}

/* ------------------ */
export const useResourceTable = <T,>({
    endpoint,
    routeId = null,
    makeColumns,
    parseUrlFilters: defaultParseUrlFilters,
    parseReponseData: defaultParseResponseData,
    parseFiltersToParams: defaultParseFiltersToParams,
    disablePagination = false,
}: UseResourceTableOptions<T>) => {
    /** 1️⃣ URL states: filters, sorting, pagination */
    const urlFiltersState = useUrlFilters(routeId);
    const [filters, setFilters] = useState<ItemsFiltersState>({
        pagination: {
            page: 0,
            size: 5,
        },
        sortBy: [],
        filters: {},
    });
    useEffect(() => {
        if (!urlFiltersState.filters) return
        const newEls = defaultParseUrlFilters ? defaultParseUrlFilters(urlFiltersState.filters) : {};
        setFilters({
            pagination: {
                page: urlFiltersState.filters.pageIndex ?? 0,
                size: urlFiltersState.filters.pageSize ?? 5,
            },
            sortBy: urlFiltersState.filters.sortBy ? sortByToState(urlFiltersState.filters.sortBy) : [],
            filters: urlFiltersState.filters,
            ...newEls,
        });
    }, [defaultParseUrlFilters, urlFiltersState.filters,]);

    /** 3️⃣ prepare backend query params */
    const queryParams = useMemo(() => {
        const { pagination, sortBy, filters: parsedFilters } = filters;
        const params: Record<string, any> = {
            "page": pagination.page + 1,
            "page_size": pagination.size,
        }
        if (sortBy?.length) {
            params["ordering"] = stateToSortFilterParam(sortBy);
        }
        Object.entries(parsedFilters).forEach(([key, value]) => {
            params[key] = value;
        });
        const newParams = defaultParseFiltersToParams ? defaultParseFiltersToParams(filters, params) : params;
        return newParams;
    }, [filters, defaultParseFiltersToParams]);

    /** 4️⃣ Fetch paginated data */
    const query = useQuery<PaginatedData<T>>({
        queryKey: [endpoint, queryParams],
        queryFn: () => simpleRequest({
            method: "GET",
            url: endpoint,
            query: queryParams,
        }),
        retry: false,
    });

    /** 5️⃣ Prepare columns (injecting actions) */
    const columns = useMemo(() => {
        return makeColumns({});
    }, []);

    const parsedResponseData = useMemo(() => {
        if (query.data) {
            return defaultParseResponseData ? defaultParseResponseData(query.data) : query.data.results;
        }
        return [];
    }, [query.data, defaultParseResponseData]);

    return {
        data: parsedResponseData,
        query: query,
        rowCount: disablePagination ? -1 : (query.data?.count ?? 0),
        loading: query.isLoading,
        columns,
        filters,
        setFilters,
        urlFiltersState,
    };
};
