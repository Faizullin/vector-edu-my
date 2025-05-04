import { FilterChangeFn, ItemsFieldFiltersState, ItemsPaginationState } from "@/client/types.gen";
import { Flex, Table } from "@chakra-ui/react";
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationOptions, RowData, SortingState, TableOptions, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import DataTablePagination from "./DataTablePagintation";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";

type Props<T> = {
  data: T[];
  columns: Array<ColumnDef<T>>;
  pagination: ItemsPaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  filters: ItemsFieldFiltersState;
  onFilterChange: FilterChangeFn<T>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  loading?: boolean;
  reactTableProps?: TableOptions<T>;
};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: {
      key: keyof TData;
      variant: "text" | "select";
      selectSearchApi?: {
        url: string;
        parseResponse?: (response: any) => { label: string; value: string }[];
        parseParams?: (value: any) => Record<string, any>;
      },
      selectOptions?: Array<{ label: string; value: string }>;
    };
  }
}


export function DataTable<T>({
  data,
  columns,
  pagination,
  paginationOptions,
  filters,
  onFilterChange,
  sorting,
  onSortingChange,
  loading,
  reactTableProps,
}: Props<T>) {
  const displayData = useMemo(() => {
    return loading ? Array.from({ length: pagination.size }, (_, i) => {
      const item: any = {
        id: i,
      };
      return item;
    }) : data;
  }, [loading, data]);
  const table = useReactTable<T>({
    data: displayData,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.page,
        pageSize: pagination.size,
      }, sorting
    },
    onSortingChange,
    ...paginationOptions,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    ...reactTableProps,
  });
  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <TableHeader<T>
          table={table}
          loading={loading || false}
          filters={filters}
          onFilterChange={onFilterChange}
        />
        <TableBody<T>
          table={table}
          loading={loading || false}
        />
      </Table.Root>
      <Flex w="100%" justifyContent="flex-end" mt={4}>
        <DataTablePagination<T>
          table={table} />
      </Flex>
    </>
  )
}