import { Button } from "@/components/ui/button";
import { MyColumnMeta } from "@/types";
import { type Column, type Table } from "@tanstack/react-table";
import { CrossIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { GlobalSearchField } from "./global-search-field";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

// Separate component for filter controls
const FilterControls = memo(
  <TData,>({
    columns,
    onResetFilters,
    isFiltered,
  }: {
    columns: Column<TData, unknown>[];
    onResetFilters: () => void;
    isFiltered: boolean;
  }) => {
    return (
      <div className="flex gap-x-2">
        {columns.map((col) => {
          const meta = col.columnDef.meta as MyColumnMeta;
          if (!meta?.filter) return null;

          return (
            <DataTableFacetedFilter
              key={col.id}
              column={col}
              title={col.columnDef.header as string}
            />
          );
        })}
        {isFiltered && <ResetButton onReset={onResetFilters} />}
      </div>
    );
  }
);

// Separate reset button component
const ResetButton = memo(({ onReset }: { onReset: () => void }) => (
  <Button
    variant="ghost"
    onClick={onReset}
    className="h-8 px-2 lg:px-3"
    size="sm"
    aria-label="Reset all filters"
  >
    Reset
    <CrossIcon className="ml-2 h-4 w-4" />
  </Button>
));

// Main toolbar controls section
const ToolbarControls = memo(
  ({
    table,
    filterColumns,
    isFiltered,
  }: {
    table: Table<any>;
    filterColumns: Array<Column<any, unknown>>;
    isFiltered: boolean;
  }) => {
    const handleResetFilters = useCallback(() => {
      table.resetColumnFilters();
    }, [table]);

    return (
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <GlobalSearchField table={table} />
        <FilterControls
          columns={filterColumns as any}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />
      </div>
    );
  }
);

// Main toolbar component
export const DataTableToolbar = memo(
  <TData,>({ table }: DataTableToolbarProps<TData>) => {
    // Memoize filtered columns to prevent unnecessary recalculations
    const filterColumns = useMemo(
      () =>
        table.getAllColumns().filter((col) => {
          const meta = col.columnDef.meta;
          return meta?.filter && meta.filter.displayType === "toolbar";
        }),
      [table]
    );

    // Memoize filter state to prevent unnecessary re-renders
    const isFiltered = useMemo(
      () => table.getState().columnFilters.length > 0,
      [table]
    );

    return (
      <div className="flex items-center justify-between">
        <ToolbarControls
          table={table}
          filterColumns={filterColumns}
          isFiltered={isFiltered}
        />
        <DataTableViewOptions table={table} />
      </div>
    );
  }
);

// Set display names for better debugging
DataTableToolbar.displayName = "DataTableToolbar";
FilterControls.displayName = "FilterControls";
ResetButton.displayName = "ResetButton";
ToolbarControls.displayName = "ToolbarControls";
