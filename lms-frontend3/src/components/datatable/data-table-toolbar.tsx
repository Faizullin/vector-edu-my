import type { MyColumnMeta } from "@/client";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { GlobalSearchField } from "./global-search-field";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const columns = table.getAllColumns().filter((col) => {
    const meta = col.columnDef.meta;
    return meta?.filter && meta.filter!.displayType === "toolbar";
  });
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <GlobalSearchField<TData> table={table} />
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
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
