import { cleanEmptyParams } from "@/utils/table/table";
import {
    getRouteApi,
    RegisteredRouter,
    RouteIds,
    SearchParamOptions,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useUrlFilters<
    TId extends RouteIds<RegisteredRouter["routeTree"]>,
    TSearchParams extends SearchParamOptions<
        RegisteredRouter,
        TId,
        TId
    >["search"],
>(routeId: TId | null) {
    const routeApi = useMemo(() => routeId ? getRouteApi<TId>(routeId) : null, [routeId]);
    const navigate = routeApi ? routeApi.useNavigate() : null;
    const [filters, ssetFilters] = useState<Record<string, any>>({})
    const searchParams = routeApi ? routeApi.useSearch() : {};

    useEffect(() => {
        if(!routeApi) return;
        ssetFilters(searchParams);
    }, [searchParams]);

    const setFilters = useCallback((partialFilters: Record<string, any>) => {
        if (!navigate) return;
        return navigate({
            search: cleanEmptyParams({
                ...filters,
                ...partialFilters,
            }) as TSearchParams,
        });
    }, [filters, navigate]);

    const resetFilters = useCallback(() => {
        if (!navigate) return;
        return navigate({
            search: cleanEmptyParams({}) as TSearchParams,
        });
    }, [navigate]);

    return { filters, setFilters, resetFilters };
}