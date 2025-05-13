import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type TableOptions,
  type PaginationState as TanstackPaginationState,
  type SortingState as TanstackSortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useDatatable<T>({
  columns,
  data: initialData,
  totalItems = 0,
  pageCount,
  ...tableOptions
}: {
  columns: ColumnDef<T, any>[];
  data: T[];
  totalItems?: number;
  pageCount?: number;
} & Partial<TableOptions<T>>) {
  // Table state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<TanstackSortingState>([]);
  const [pagination, setPagination] = useState<TanstackPaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate page count based on total items and page size
  const calculatedPageCount =
    pageCount ?? Math.ceil(totalItems / pagination.pageSize);

  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Create and configure the table
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination,
    },
    enableRowSelection: true,
    pageCount: calculatedPageCount,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...tableOptions,
  });

  // Helper function to get selected rows
  const getSelectedRows = useCallback(() => {
    return table.getFilteredSelectedRowModel().rows;
  }, [table]);

  // Helper function to reset row selection
  const resetRowSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  return useMemo(() => {
    return {
      table,
      getSelectedRows,
      resetRowSelection,
      dataControl: {
        set: setData,
        get: () => data,
      },
    };
  }, [table, getSelectedRows, resetRowSelection, data, setData]);
}
