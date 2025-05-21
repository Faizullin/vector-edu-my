import {
  ArrowDown,
  ArrowUp,
  CopyIcon,
  ImportIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback } from "react";
import { useEditor } from "../context/editor-context";
import { useBlockImportDialog, useBlockSchema } from "../hooks";
import type { BlockIdentifier } from "../types";

interface BlockMenuProps {
  blockId: BlockIdentifier;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockMenu({
  blockId,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: BlockMenuProps) {
  const { duplicateBlock, removeBlock } = useEditor();
  const { schema, block } = useBlockSchema(blockId);
  const { showDialog } = useBlockImportDialog<any>(block.id);
  const handleImport = useCallback(() => {
    const tmp = schema.sideMenu();
    showDialog({
      title: "Video",
      parseSearchResponse: tmp.parseSearchResponse,
    });
  }, [showDialog, schema]);
  return (
    <div className="block-menu flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-white border shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={!canMoveUp}
      >
        <ArrowUp className="h-3 w-3" />
        <span className="sr-only">Move up</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white border shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleImport}>
            <ImportIcon className="mr-2 h-4 w-4" />
            <span>Import</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateBlock(blockId)}>
            <CopyIcon className="mr-2 h-4 w-4" />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => removeBlock(blockId)}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="text-red-500">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-white border shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={!canMoveDown}
      >
        <ArrowDown className="h-3 w-3" />
        <span className="sr-only">Move down</span>
      </Button>
    </div>
  );
}
