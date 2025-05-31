import type { FieldItem, PaginatedData } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImportNiceDialog from "./components/ImportNiceDialog";
import { useEditor } from "./context/editor-context";
import { schema } from "./schema";
import type { Block, BlockIdentifier, ComponentBase } from "./types";
import { focusWithCursorToEnd } from "./utils";
import { NiceModalHocPropsExtended } from "@/context/nice-modal-context";
import { showComponentNiceDialog } from "@/utils/nice-modal";

interface UseContentEditPtopsReturnType {
  ref: any;
  contentEditable: boolean;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onBlur: (e: React.FormEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  suppressContentEditableWarning: boolean;
  "data-editable-field": string;
}

export const useContentEditProps = (
  name: string,
  block: Block,
  connect: {
    nextControl: UseContentEditPtopsReturnType | "next-block" | null;
    fieldname: string;
  }
): UseContentEditPtopsReturnType => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { updateBlockField, selectNextBlock } = useEditor();
  const handleContentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey
        // && onEnterKeyInContent
      ) {
        e.preventDefault();
        if (connect.nextControl !== null) {
          if (connect.nextControl === "next-block") {
            selectNextBlock(block.id, {
              focusFirstInputFieldname: "0",
            });
          } else {
            focusWithCursorToEnd(connect.nextControl.ref.current);
          }
        }
        // onEnterKeyInContent();
      }
      // else if (
      //         e.key === "Backspace" &&
      //         contentRef.current?.textContent === "" &&
      //         onBackspaceKey
      //       ) {
      //         e.preventDefault();
      //         onBackspaceKey();
      //       }
    },
    [connect, selectNextBlock]
  );

  const onUpdate = useCallback(
    (value: string) => {
      updateBlockField(block.id, {
        ...block.data,
        values: {
          ...block.data.values,
          [name]: value,
        },
      });
    },
    [updateBlockField, name, block.id, block.data]
  );

  const content = (block.data as any).values[name];
  // Update the editor content when the content prop changes
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== content) {
      contentRef.current.textContent = content;
    }
  }, [content]);

  const staticMode = block.data?.static || false;

  return {
    ref: contentRef,
    contentEditable: !staticMode,
    onInput: (e: any) => {
      const target = e.target as HTMLHeadingElement;
      onUpdate(target.textContent || "");
    },
    onBlur: (e: any) => {
      const target = e.target as HTMLHeadingElement;
      onUpdate(target.textContent || "");
    },
    onKeyDown: handleContentKeyDown,
    suppressContentEditableWarning: true,
    "data-editable-field": `${block.id}.${connect.fieldname}`,
  };
};

export const useControlState = <T>(defaultValue: T | null = null) => {
  const [state, setState] = useState<T | null>(defaultValue);
  return {
    state,
    setState,
  };
};

export const useBlockSchema = (blockId: BlockIdentifier) => {
  const { blocks } = useEditor();
  return useMemo(() => {
    const block = blocks.find((block) => block.id === blockId);
    if (!block) {
      throw new Error(`Block with id "${blockId}" not found.`);
    }
    return {
      block,
      schema: schema[block.type],
    };
  }, [blocks, blockId]);
};

export const useBlockImportDialog = <T extends ComponentBase>(
  blockId: BlockIdentifier,
  conf?: {
    static?: boolean;
  }
) => {
  const { schema, block } = useBlockSchema(blockId);
  const { updateBlockField } = useEditor();
  const showDialog = useCallback(
    (
      props: NiceModalHocPropsExtended<{
        title: string;
        parseSearchResponse: (response: PaginatedData<T>) => FieldItem[];
      }>
    ) => {
      const menu = schema.sideMenu();
      showComponentNiceDialog(ImportNiceDialog, {
        title: menu.title,
        type: block.type,
        parseSearchResponse: props.parseSearchResponse,
      }).then((result: any) => {
        if (result?.record) {
          const newValues = menu.parseObjToValues(result.record);
          const objWithoutId = block.data.obj
            ? { ...result.record, id: block.data.obj.id }
            : null;
          updateBlockField(blockId, {
            ...block.data,
            values: newValues,
            obj: objWithoutId,
            static: conf?.static || false,
          });
          result.modal.hide();
        }
      });
    },
    [schema, block, updateBlockField, conf]
  );
  return {
    showDialog,
  };
};
