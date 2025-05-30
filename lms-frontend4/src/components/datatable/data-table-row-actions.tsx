import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Row } from "@tanstack/react-table";
import { DotIcon, Edit2, Trash2 } from "lucide-react";
import { useMemo, type ReactNode } from "react";

type ActionEl<T> = {
  type?: "default" | "extra";
  render?: ({ row }: { row: Row<T> }) => ReactNode;
  callback?: ({ row }: { row: Row<T> }) => void;
  shortcutIcon?: ReactNode;
  label?: string;
};
interface DataTableRowActionsProps<T> {
  row: Row<T>;
  defaultActions?: {
    edit?: ActionEl<T>;
    delete?: ActionEl<T>;
  };
  actions?: Record<string, ActionEl<T>>;
}

export function DataTableRowActions<T>({
  row,
  actions,
  defaultActions,
}: DataTableRowActionsProps<T>) {
  const defaultActionsList = useMemo(() => {
    const arr: ReactNode[] = [];
    if (defaultActions) {
      if (defaultActions.edit) {
        if (defaultActions.edit?.render) {
          arr.push(defaultActions.edit.render({ row }));
        } else {
          const icon = defaultActions.edit?.shortcutIcon || <Edit2 size={16} />;
          arr.push(
            <DropdownMenuItem
              onClick={() => defaultActions.edit!.callback!({ row })}
            >
              {defaultActions.edit?.label || "Edit"}
              <DropdownMenuShortcut>{icon}</DropdownMenuShortcut>
            </DropdownMenuItem>
          );
        }
      }
      if (defaultActions.delete) {
        if (defaultActions.delete?.render) {
          arr.push(defaultActions.delete.render({ row }));
        } else {
          const icon = defaultActions.delete?.shortcutIcon || (
            <Trash2 size={16} />
          );
          arr.push(
            <DropdownMenuItem
              onClick={() => defaultActions.delete!.callback!({ row })}
              className="text-red-500!"
            >
              {defaultActions.delete?.label || "Delete"}
              <DropdownMenuShortcut>{icon}</DropdownMenuShortcut>
            </DropdownMenuItem>
          );
        }
      }
    }
    if (actions) {
      Object.entries(actions).forEach(([_, action]) => {
        if (action?.render) {
          arr.push(action.render({ row }));
        } else {
          const icon = action.shortcutIcon;
          arr.push(
            <DropdownMenuItem onClick={() => action.callback?.({ row })}>
              {action.label || "Edit"}
              <DropdownMenuShortcut>{icon}</DropdownMenuShortcut>
            </DropdownMenuItem>
          );
        }
      });
    }
    return arr;
  }, [row]);
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {defaultActionsList.map((action, index) => {
            return <div key={index}>{action}</div>;
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
