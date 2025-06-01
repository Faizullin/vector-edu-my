import {Checkbox} from "@/components/ui/checkbox";
import {simpleRequest} from "@/lib/simpleRequest";
import {cn} from "@/lib/utils";
import {DocumentBase, PaginatedData} from "@/types";
import {useQuery} from "@tanstack/react-query";
import {
    AccessorColumnDef,
    ColumnFiltersState,
    DisplayColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState as TanstackPaginationState,
    RowSelectionState,
    SortingState as TanstackSortingState,
    TableOptions,
    useReactTable,
} from "@tanstack/react-table";
import {useCallback, useEffect, useMemo, useState} from "react";

type MyColumn<T> = AccessorColumnDef<T> | DisplayColumnDef<T>;
export type UseResourceProps<T extends DocumentBase> = {
    name: string;
    url: string;
    columns: Array<MyColumn<T>>;
    fetchFn?: (url: string, params: Record<string, string>) => Promise<PaginatedData<T>>;
    useRowSelection?: boolean;
    enabled?: boolean;
    transformToApiParams?: <M = unknown>(data: M) => M;
    reactTableOptions?: Partial<TableOptions<T>>;
};

export const useResource = <T extends DocumentBase>({
                                                        name,
                                                        url,
                                                        columns: initialColumns,
                                                        fetchFn = async (url, params) => {
                                                            return await (simpleRequest<PaginatedData<T>>({
                                                                url: url,
                                                                method: "GET",
                                                                params,
                                                            }) as Promise<PaginatedData<T>>);
                                                        },
                                                        useRowSelection = false,
                                                        reactTableOptions = {},
                                                        transformToApiParams = (data) => data,
                                                        enabled = true,
                                                    }: UseResourceProps<T>) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});

    // Separate state tracking to avoid circular dependency
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [sorting, setSorting] = useState<TanstackSortingState>([]);
    const [pagination, setPagination] = useState<TanstackPaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const query = useQuery({
        queryKey: [name, queryParams],
        queryFn: () => fetchFn(url, queryParams),
        enabled: isInitialized,
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    });

    useEffect(() => {
        if (query.data) {
            setTotalItems(query.data.count);
        }
    }, [query.data]);
    useEffect(() => {
        setIsInitialized(enabled);
    }, [enabled]);

    const calculatedPageCount = Math.ceil(totalItems / pagination.pageSize);
    const columns = useMemo(() => {
        const newCols = initialColumns;
        if (useRowSelection) {
            const newEl: MyColumn<T> = {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                ),
                meta: {
                    className: cn(
                        "sticky md:table-cell left-0 z-10 rounded-tl",
                        "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted"
                    ),
                },
                cell: ({row}) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            };
            return [newEl, ...newCols];
        }
        return newCols;
    }, [initialColumns, useRowSelection]);

    const tableConfig = useMemo(
        () => ({
            data: query.data?.results || [],
            columns,
            state: {
                rowSelection,
                columnFilters,
                globalFilter,
                sorting,
                pagination,
            },
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
            enableGlobalFilter: true,
            enableRowSelection: true,
            pageCount: calculatedPageCount,
            onRowSelectionChange: setRowSelection,
            onColumnFiltersChange: setColumnFilters,
            onGlobalFilterChange: setGlobalFilter,
            onSortingChange: setSorting,
            onPaginationChange: setPagination,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            ...reactTableOptions,
        }),
        [
            query.data?.results,
            columns,
            rowSelection,
            columnFilters,
            globalFilter,
            sorting,
            pagination,
            calculatedPageCount,
            reactTableOptions,
        ]
    );
    const table = useReactTable(tableConfig);

    // ✅ Fix: Use individual state values instead of table.getState()
    useEffect(() => {
        const {pagination, sorting, columnFilters, globalFilter} =
            table.getState();
        const data: Record<string, string> = {
            page: `${pagination.pageIndex + 1}`,
            page_size: `${pagination.pageSize}`
        };

        if (sorting.length > 0) {
            data["ordering"] = sorting[0].desc ? "-" + sorting[0].id : sorting[0].id;
        }

        Object.entries(
            columnFilters.reduce((acc, filter) => {
                acc[filter.id] = filter.value;
                return acc;
            }, {} as Record<string, unknown>)
        ).forEach(([key, value]) => {
            if (value) {
                data[key] = value as string;
            }
        });
        if (globalFilter) {
            data["search"] = globalFilter;
        }
        setQueryParams({
            ...transformToApiParams(data),
        });
    }, [pagination, sorting, columnFilters, globalFilter]); // ✅ Specific dependencies

    // Helper functions stay the same...
    const getSelectedRows = useCallback(() => {
        return table.getFilteredSelectedRowModel().rows;
    }, [table]);

    const resetRowSelection = useCallback(() => {
        setRowSelection({});
    }, []);

    return {
        datatable: {table, getSelectedRows, resetRowSelection, setColumnFilters},
        query,
        isLoading: query.isLoading || !isInitialized,
        data: query.data?.results || [],
    };
};
