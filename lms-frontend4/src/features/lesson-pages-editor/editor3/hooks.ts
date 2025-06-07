import { NiceModalHocPropsExtended } from "@/context/nice-modal-context";
import type { FieldItem, PaginatedData } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImportTemplateNiceDialog from "./components/import-template-nice-dialog";
import MediaViewNiceDialog from "./components/media-library-nice-dialog";
import { useEditor } from "./context/editor-context";
import { useLoadDataContext } from "./context/load-data-context";
import { schema } from "./schema";
import type { AttachmentDocument, Block, BlockIdentifier, ComponentBase, TemplateDocument } from "./types";
import { focusWithCursorToEnd } from "./utils";

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
) => {
  const { schema, block } = useBlockSchema(blockId);
  const { updateBlockField, } = useEditor();
  const { postObj, } = useLoadDataContext();
  const showDialog = useCallback(
    (
      props: NiceModalHocPropsExtended<{
        title: string;
        parseSearchResponse: (response: PaginatedData<T>) => FieldItem[];
      }>
    ) => {
      const menu = schema.sideMenu();
      showComponentNiceDialog(ImportTemplateNiceDialog, {
        title: menu.title,
        type: block.type,
        post_id: postObj.id,
        parseSearchResponse: props.parseSearchResponse,
      }).then((response) => {
        if (response.result) {
          const { record } = response.result as {
            record: TemplateDocument;
          };
          let newValues: Record<string, any> = {};
          try {
            const JSONContent = JSON.parse(record.content);
            newValues = JSONContent.values || {};
          } catch (error) {
            showToast("error", {
              message: "Error importing template",
              data: {
                description: "Invalid JSON content in the template.",
              },
            });
            return;
          }
          updateBlockField(blockId, {
            ...block.data,
            values: newValues,
            template_id: record.id,
            static: true,
          });
        }
      });
    },
    [schema, block, updateBlockField, postObj],
  );
  return {
    showDialog,
  };
};

export const useBlockMediaAttachmentDialog = (
  blockId: BlockIdentifier,
) => {
  const { updateBlockField } = useEditor();
  const { postObj } = useLoadDataContext();
  const { schema, block, } = useBlockSchema(blockId);

  const showDialog = useCallback(
    () => {
      showComponentNiceDialog(MediaViewNiceDialog, {
        post_id: postObj.id,
        block,
      }).then((response) => {
        console.log("Media dialog response:", response);
        if (response.result) {
          const { record } = response.result as {
            record: AttachmentDocument;
          };
          const newValues = {
            ...block.data.values,
            image: {
              id: record.id,
              name: record.name,
              url: record.url,
              file_type: record.file_type,
              size: record.size,
              extension: record.extension,
            }
          };
          // Update the block with the selected media
          updateBlockField(blockId, {
            ...block.data,
            values: newValues,
          });
        }
      });
    },
    [postObj],
  );

  return {
    showDialog,
  };
}
