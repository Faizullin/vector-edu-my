import type { DocumentBase, MyColumnMeta } from "@/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { useResource } from "@/hooks/use-resource";
import { cn } from "@/lib/utils";
import { flexRender, type RowData } from "@tanstack/react-table";
import { useMemo, type PropsWithChildren } from "react";
import { Button } from "../ui/button";
import { DataTableActionsMenu } from "./data-table-actions-menu";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { ActionComponent } from "./types";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: MyColumnMeta<TData>["filter"];
    className?: string;
    sizeBorderStyle?: boolean;
  }
}

export interface DatatableProps<T extends DocumentBase> {
  resource: ReturnType<typeof useResource<T>>;
}

export function Datatable<T extends DocumentBase>({
  resource,
}: DatatableProps<T>) {
  const { datatable, data } = resource;
  const columns = datatable.table.getAllColumns();
  return (
    <div className="space-y-4">
      <DataTableToolbar table={datatable.table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {datatable.table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const classes = useMemo(() => {
                    return cn(
                      header.column.columnDef.meta?.sizeBorderStyle
                        ? cn(
                            "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                            "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                            "sticky left-6 md:table-cell",
                          )
                        : "",
                      header.column.columnDef.meta?.className || "",
                    );
                  }, [header.column.columnDef.meta]);
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={classes}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <DataTableColumnHeader
                          column={header.column}
                          title={String(header.column.columnDef.header)}
                        />
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              datatable.table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => {
                    const classes = cn(
                      cell.column.columnDef.meta?.sizeBorderStyle
                        ? cn(
                            "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                            "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                            "sticky left-6 md:table-cell",
                          )
                        : "",
                      cell.column.columnDef.meta?.className || "",
                    );
                    return (
                      <TableCell key={cell.id} className={classes}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={datatable.table} />
    </div>
  );
}

interface DatatablePagePanelProps<T extends DocumentBase>
  extends PropsWithChildren {
  resource: ReturnType<typeof useResource<T>>;
  topbar: {
    title: string;
    subtitle: string;
  };
  actions?: ActionComponent<T>[];
}

export function DatatablePagePanel<T extends DocumentBase>({
  actions,
  resource,
  topbar,
}: DatatablePagePanelProps<T>) {
  const panelActions = useMemo(() => {
    return actions?.filter((action) => action.renderType === "panel") || [];
  }, [actions]);
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{topbar!.title}</h2>
          <p className="text-muted-foreground">{topbar!.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <DataTableActionsMenu actions={actions || []} />
          {panelActions.map((action, index) => {
            return (
              <Button
                key={index}
                size="sm"
                onClick={action.callback}
                disabled={action.loading}
              >
                {action.shortcutIcon} <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <Datatable resource={resource} />
      </div>
    </>
  );
}
