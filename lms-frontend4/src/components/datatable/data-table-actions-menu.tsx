import { useMemo } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { ActionComponent } from "./types";
import { FlipHorizontal2Icon } from "lucide-react";

interface DataTableActionsMenuProps<T> {
  actions: ActionComponent<T>[];
}

export function DataTableActionsMenu<T>({
  actions: initialActions,
}: DataTableActionsMenuProps<T>) {
  const actions = useMemo(() => {
    return initialActions.filter((action) => {
      return action.renderType === "actions-menu";
    });
  }, [initialActions]);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <FlipHorizontal2Icon className="mr-2 h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {actions.map((action, index) => {
          return (
            <DropdownMenuItem
              key={index}
              className="capitalize"
              onClick={action.callback}
              disabled={action.loading || action.disabled}
            >
              {action.shortcutIcon} <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
