"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { DataTablePagination } from "@/components/datatable/data-table-pagination";
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResource, UseResourceProps } from "@/hooks/use-resource";
import { cn } from "@/lib/utils";
import { DocumentBase, MyColumnMeta } from "@/types";
import { flexRender, Row, RowData } from "@tanstack/react-table";
import {
  createContext,
  memo,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: MyColumnMeta["filter"];
    className?: string;
    sizeBorderStyle?: boolean;
  }
}

// ✅ Enhanced Action Types
interface ActionComponent<T extends DocumentBase> {
  label: string;
  callback: (item?: T, selectedItems?: T[]) => void;
  loading?: boolean;
  icon?: ReactNode;
  renderType?: "panel" | "menu" | "row";
  variant?: "default" | "destructive" | "outline" | "secondary";
  disabled?: boolean;
  hidden?: boolean;
}

// ✅ Action Context for dynamic actions
interface ActionContext<T extends DocumentBase> {
  selectedRows: Row<T>[];
  data: T[];
  totalCount: number;
  hasSelection: boolean;
}

// ✅ Enhanced ActionRegistry that supports both static and dynamic actions
type ActionRegistry<T extends DocumentBase> = Record<
  string,
  ActionComponent<T> | ((context: ActionContext<T>) => ActionComponent<T>)
>;

// ✅ Context Types
type ResourceType<T extends DocumentBase> = ReturnType<typeof useResource<T>>;

interface DatatableContextType<T extends DocumentBase> {
  resource: ResourceType<T>;
  actions: ActionRegistry<T>;
  topbar?: {
    title: string;
    subtitle: string;
  };
}

// ✅ Context Creation
const DatatableContext = createContext<DatatableContextType<any> | null>(null);

// ✅ Custom Hook
function useDatatable<T extends DocumentBase>(): DatatableContextType<T> {
  const context = useContext(DatatableContext);
  if (!context) {
    throw new Error("useDatatable must be used within DatatableRoot");
  }
  return context;
}

// ✅ Helper function to resolve actions (static or dynamic)
function resolveAction<T extends DocumentBase>(
  actionDefinition:
    | ActionComponent<T>
    | ((context: ActionContext<T>) => ActionComponent<T>),
  context: ActionContext<T>
): ActionComponent<T> {
  if (typeof actionDefinition === "function") {
    return actionDefinition(context);
  }
  return actionDefinition;
}

// ✅ Root Provider Component
interface DatatableRootProps<T extends DocumentBase> extends PropsWithChildren {
  resource: UseResourceProps<T>;
  actions?: ActionRegistry<T>;
  topbar?: {
    title: string;
    subtitle: string;
  };
}

const DatatableRoot = <T extends DocumentBase>({
  children,
  resource: resourceProps,
  actions = {},
  topbar,
}: DatatableRootProps<T>) => {
  const resource = useResource<T>(resourceProps);

  const contextValue: DatatableContextType<T> = useMemo(
    () => ({
      resource,
      actions,
      topbar,
    }),
    [resource, actions, topbar]
  );

  return (
    <DatatableContext.Provider value={contextValue}>
      {children}
    </DatatableContext.Provider>
  );
};

// ✅ Enhanced Panel Component with dynamic action support
interface DatatablePanelProps extends PropsWithChildren {
  className?: string;
  panelActions?: string[]; // Action names to show in panel
  menuActions?: string[]; // Action names to show in dropdown menu
}

const DatatablePanel = ({
  children,
  className,
  panelActions = [],
  menuActions = [],
}: DatatablePanelProps) => {
  const { actions, topbar, resource } = useDatatable();

  const selectedRows = resource.datatable.getSelectedRows();
  const { data } = resource;

  // ✅ Create action context
  const actionContext = useMemo(
    () => ({
      selectedRows,
      data,
      totalCount: data.length,
      hasSelection: selectedRows.length > 0,
    }),
    [selectedRows, data]
  );

  // ✅ Resolve panel actions dynamically
  const resolvedPanelActions = useMemo(() => {
    return panelActions
      .map((actionName) => {
        const actionDef = actions[actionName];
        if (!actionDef) return null;

        const resolvedAction = resolveAction(actionDef, actionContext);
        if (resolvedAction.renderType !== "panel" || resolvedAction.hidden)
          return null;

        return { name: actionName, action: resolvedAction };
      })
      .filter((item) => item !== null);
  }, [panelActions, actions, actionContext]);

  // ✅ Resolve menu actions dynamically
  const resolvedMenuActions = useMemo(() => {
    return menuActions
      .map((actionName) => {
        const actionDef = actions[actionName];
        if (!actionDef) return null;

        const resolvedAction = resolveAction(actionDef, actionContext);
        if (resolvedAction.renderType !== "menu" || resolvedAction.hidden)
          return null;

        return { name: actionName, action: resolvedAction };
      })
      .filter((item) => item !== null);
  }, [menuActions, actions, actionContext]);
  return (
    <div className={cn("space-y-4", className)}>
      {topbar && (
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {topbar.title}
            </h2>
            <p className="text-muted-foreground">{topbar.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {/* Panel Actions */}
            {resolvedPanelActions.map(({ name, action }) => (
              <Button
                key={name}
                size="sm"
                variant={action.variant || "default"}
                onClick={() =>
                  action.callback(
                    undefined,
                    selectedRows.map((r) => r.original)
                  )
                }
                disabled={action.loading || action.disabled}
              >
                {action.icon}
                <span>{action.label}</span>
              </Button>
            ))}

            {/* Bulk Delete Action (if selection exists) */}
            {actionContext.hasSelection && actions.bulkDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const bulkAction = resolveAction(
                    actions.bulkDelete,
                    actionContext
                  );
                  bulkAction.callback(
                    undefined,
                    selectedRows.map((r) => r.original)
                  );
                }}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}

            {/* Dropdown Menu Actions */}
            {resolvedMenuActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* <DropdownMenuLabel>Additional Actions</DropdownMenuLabel> */}
                  <DropdownMenuSeparator />
                  {resolvedMenuActions.map(({ name, action }) => (
                    <DropdownMenuItem
                      key={name}
                      onClick={() =>
                        action.callback(
                          undefined,
                          selectedRows.map((r) => r.original)
                        )
                      }
                      disabled={action.loading || action.disabled}
                      className={cn(
                        action.variant === "destructive" &&
                          "text-destructive focus:text-destructive w-48"
                      )}
                    >
                      {action.icon && (
                        <span className="mr-2 h-4 w-4">{action.icon}</span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {children}
      </div>
    </div>
  );
};

// ✅ Table Component (unchanged)
const DatatableTable = <T extends DocumentBase>() => {
  const { resource } = useDatatable<T>();
  const { datatable } = resource;

  return (
    <div className="space-y-4">
      <DataTableToolbar table={datatable.table as any} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {datatable.table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const classes = useMemo(() => {
                    return cn(
                      header.column.columnDef.meta?.sizeBorderStyle
                        ? cn(
                            "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                            "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                            "sticky left-6 md:table-cell"
                          )
                        : "",
                      header.column.columnDef.meta?.className || ""
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
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <DatatableTableBody />
        </Table>
      </div>
      <DataTablePagination table={datatable.table} />
    </div>
  );
};

// ✅ Table Body Component (unchanged)
const DatatableTableBody = memo(<T extends DocumentBase>() => {
  const { resource } = useDatatable<T>();
  const { datatable, data } = resource;

  const columns = useMemo(() => {
    return datatable.table.getAllColumns();
  }, [datatable.table]);

  return (
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
                      "sticky left-6 md:table-cell"
                    )
                  : "",
                cell.column.columnDef.meta?.className || ""
              );
              return (
                <TableCell key={cell.id} className={classes}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

DatatableTableBody.displayName = "DatatableTableBody";

// ✅ Enhanced Row Actions Component with dynamic support
interface DatatableRowActionsProps<T extends DocumentBase> {
  item: T;
  actionNames: string[];
}

const DatatableRowActions = <T extends DocumentBase>({
  item,
  actionNames,
}: DatatableRowActionsProps<T>) => {
  const { actions, resource } = useDatatable<T>();
  const selectedRows = resource.datatable.getSelectedRows();

  const actionContext = useMemo(
    () => ({
      selectedRows,
      data: resource.data,
      totalCount: resource.data.length,
      hasSelection: selectedRows.length > 0,
    }),
    [selectedRows, resource.data]
  );

  const resolvedActions = useMemo(() => {
    return actionNames
      .map((actionName) => {
        const actionDef = actions[actionName];
        if (!actionDef) return null;

        const resolvedAction = resolveAction(actionDef, actionContext);
        if (resolvedAction.renderType !== "row" || resolvedAction.hidden)
          return null;

        return { name: actionName, action: resolvedAction };
      })
      .filter((item) => item !== null);
  }, [actionNames, actions, actionContext]);

  return (
    <div className="flex items-center gap-2">
      {resolvedActions.map(({ name, action }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          onClick={() => action.callback(item)}
          disabled={action.loading || action.disabled}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
};

// ✅ Export Compound Component
const Datatable = {
  Root: DatatableRoot,
  Panel: DatatablePanel,
  Table: DatatableTable,
  TableBody: DatatableTableBody,
  RowActions: DatatableRowActions,
  useDatatable, // Export the hook
};

export default Datatable;
export { useDatatable };
export type { ActionComponent, ActionContext, ActionRegistry };
