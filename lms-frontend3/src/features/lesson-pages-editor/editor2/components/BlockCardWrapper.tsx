import { useMemo, type PropsWithChildren } from "react";
import { useEditor } from "../context/editor-context";
import { schema } from "../schema";
import type { Block } from "../types";
import { AlertCircle } from "lucide-react";

export const BlockCardWrapper = ({
  children,
  block,
}: PropsWithChildren<{
  block: Block;
}>) => {
  const { addBlock, errors } = useEditor();
  const blockSuggestionMenu = useMemo(() => {
    return schema[block.type].suggestionMenu({
      addBlock,
    });
  }, [block.type, addBlock]);
  const blockError = useMemo(() => {
    return errors.find((error) => error.block_id === block.id);
  }, [errors, block.id]);
  return (
    <div
      className={`border rounded-lg overflow-hidden ${blockError ? "border-red-500 shadow-sm shadow-red-500" : ""}`}
    >
      <div className="flex items-center justify-between bg-gray-50 py-1 px-2 border-b">
        <div className="flex items-center gap-1 text-xs font-medium">
          {blockSuggestionMenu.icon({
            size: 12,
          })}
          <span className="capitalize">{blockSuggestionMenu.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {blockError && (
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                <span>{blockError.error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
