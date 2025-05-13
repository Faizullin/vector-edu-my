import type { DocumentBase, PaginatedData } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import type { QueryParams } from "@/components/datatable/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  type AccessorColumnDef,
  type DisplayColumnDef,
  type TableOptions,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useDatatable } from "./use-datatable";

type MyColumn<T> = AccessorColumnDef<T, any> | DisplayColumnDef<T, any>;
type UseResourceProps<T extends DocumentBase> = {
  name: string;
  url: string;
  columns: Array<MyColumn<T>>;
  fetchFn?: (params: QueryParams) => Promise<PaginatedData<T>>;
  useRowSelection?: boolean;
  enabled?: boolean;
  transformToApiParams?: <M = any>(data: M) => M;
  reactTableOptions?: Partial<TableOptions<T>>;
};

export function useResource<T extends DocumentBase>({
  name,
  url,
  columns: initialColumns,
  fetchFn = (params) => {
    return simpleRequest({
      url: `${url}/`,
      method: "GET",
      query: params,
    });
  },
  useRowSelection = false,
  enabled = true,
  transformToApiParams = (data) => data,
  reactTableOptions,
}: UseResourceProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const columns = useMemo(() => {
    const newCols = initialColumns;
    if (useRowSelection) {
      const newEl: MyColumn<T> = {
        id: "select",
        header: ({ table }) => (
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
            "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
          ),
        },
        cell: ({ row }) => (
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
      newCols.unshift(newEl);
    }
    return newCols;
  }, [initialColumns, useRowSelection]);

  const datatable = useDatatable<T>({
    columns,
    data,
    totalItems,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    ...reactTableOptions,
  });

  const queryParams = useMemo(() => {
    const { pagination, sorting, columnFilters, globalFilter } =
      datatable.table.getState();
    const data: any = {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
    };
    if (sorting.length > 0) {
      data["ordering"] = sorting[0].id;
      data["ordering"] = sorting[0].desc ? "-" + sorting[0].id : sorting[0].id;
    }

    Object.entries(
      columnFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, any>,
      ),
    ).forEach(([key, value]) => {
      if (value) {
        data[key] = value;
      }
    });

    if (globalFilter) {
      data["search"] = globalFilter;
    }
    return {
      ...transformToApiParams(data),
    } as QueryParams;
  }, [datatable.table.getState()]);

  const query = useQuery<PaginatedData<T>>({
    queryKey: [name, queryParams],
    queryFn: () => fetchFn(queryParams),
    retry: 2,
    enabled,
  });

  useEffect(() => {
    if (query.data) {
      setData(query.data.results);
      setTotalItems(query.data.count);
    }
  }, [query.data]);

  return useMemo(
    () => ({
      query,
      data,
      datatable,
      totalItems,
    }),
    [query, datatable, data, totalItems],
  );
}
