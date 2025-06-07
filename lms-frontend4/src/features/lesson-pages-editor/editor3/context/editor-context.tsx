import { createContext, useCallback, useContext, useState } from "react";
import { useControlState } from "../hooks";
import { schema } from "../schema";
import type {
  Block,
  BlockDataField,
  BlockError,
  BlockIdentifier,
  ComponentBase,
  SaveDataJsonType,
  TemplateDocument,
} from "../types";
import { focusFirstInputFn, generateBlockId } from "../utils";

interface EditorContextType<T extends ComponentBase = ComponentBase> {
  updateBlockField: <T extends ComponentBase = ComponentBase>(
    blockId: BlockIdentifier,
    data: BlockDataField<T>
  ) => void;
  removeBlock: (blockId: BlockIdentifier) => void;
  addBlock: (type: string, afterId?: BlockIdentifier) => void;
  selectNextBlock: (
    blockId: BlockIdentifier,
    conf?: {
      focusFirstInputFieldname?: string;
    }
  ) => void;
  selectPreviousBlock: (blockId: BlockIdentifier) => void;
  blocks: Block<T>[];
  setBlocks: React.Dispatch<React.SetStateAction<Block<T>[]>>;
  setInitialContent: (content: SaveDataJsonType) => Promise<void>;
  duplicateBlock: (blockId: BlockIdentifier) => void;
  moveBlock: (blockId: BlockIdentifier, direction: "up" | "down") => void;
  selectedBlockIdControl: {
    state: BlockIdentifier | null;
    setState: React.Dispatch<React.SetStateAction<BlockIdentifier | null>>;
  };
  hoveredBlockIdControl: {
    state: BlockIdentifier | null;
    setState: React.Dispatch<React.SetStateAction<BlockIdentifier | null>>;
  };
  ready: boolean;
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
  errors: BlockError[];
  setErrors: React.Dispatch<React.SetStateAction<BlockError[]>>;
  changeState: {
    state: boolean;
    setState: React.Dispatch<React.SetStateAction<boolean>>;
  };
  publicationState: {
    state: "draft" | "published";
    setState: React.Dispatch<React.SetStateAction<"draft" | "published">>;
  };
  templates: TemplateDocument[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateDocument[]>>;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [errors, setErrors] = useState<BlockError[]>([]);
  const [changed, setChanged] = useState(false);
  const [publicationStatus, setPublicationStatus] = useState<"draft" | "published">("draft");
  const [templates, setTemplates] = useState<TemplateDocument[]>([]);

  const updateBlockField = useCallback(
    (blockId: BlockIdentifier, data: BlockDataField) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? {
              ...block,
              data: {
                ...data,
              },
            }
            : block
        )
      );
      setChanged(true);
    },
    []
  );

  const removeBlock = useCallback((blockId: BlockIdentifier) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    setChanged(true);
  }, []);

  const moveBlock = useCallback(
    (blockId: BlockIdentifier, direction: "up" | "down") => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index === -1) {
        throw new Error(`Block with id "${blockId}" not found`);
      }
      const newBlocks = [...blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= blocks.length) return;
      [newBlocks[index], newBlocks[targetIndex]] = [
        newBlocks[targetIndex],
        newBlocks[index],
      ];
      setBlocks(newBlocks);
    },
    [blocks]
  );

  const selectedBlockIdControl = useControlState<BlockIdentifier>();
  const hoveredBlockIdControl = useControlState<BlockIdentifier>();

  const addBlock = useCallback(
    (type: string, afterId?: BlockIdentifier) => {
      const blockSchema = schema[type];
      if (!blockSchema) {
        throw new Error(`Block type "${type}" not found in schema`);
      }
      const defaultValues =
        blockSchema.initialContent.default || blockSchema.initialContent.empty;
      const newBlock = {
        id: generateBlockId(),
        type,
        data: {
          values: defaultValues,
          obj: null,
          static: false,
        },
      } as Block;
      if (afterId) {
        const index = blocks.findIndex((block) => block.id === afterId);
        if (index !== -1) {
          setBlocks((prev) => [
            ...prev.slice(0, index + 1),
            newBlock,
            ...prev.slice(index + 1),
          ]);
        }
      } else {
        setBlocks((prev) => [...prev, newBlock]);
      }
      selectedBlockIdControl.setState(newBlock.id);
      setChanged(true);
    },
    [blocks]
  );

  const selectNextBlock = useCallback(
    (
      blockId: BlockIdentifier,
      conf?: {
        focusFirstInputFieldname?: string;
      }
    ) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index !== -1 && index < blocks.length - 1) {
        const nextBlock = blocks[index + 1];
        selectedBlockIdControl.setState(nextBlock.id);
        hoveredBlockIdControl.setState(nextBlock.id);
        if (conf?.focusFirstInputFieldname) {
          focusFirstInputFn(nextBlock, "0");
        }
      }
    },
    [blocks]
  );

  const selectPreviousBlock = useCallback(
    (blockId: BlockIdentifier) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index > 0) {
        // Logic to select the previous block
      }
    },
    [blocks]
  );

  const setInitialContent = useCallback(async (content: SaveDataJsonType) => {
    setBlocks(content.blocks);
  }, []);

  const duplicateBlock = useCallback(
    (blockId: BlockIdentifier) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index === -1) {
        throw new Error(`Block with id "${blockId}" not found`);
      }
      const newBlock = { ...blocks[index], id: generateBlockId() };
      setBlocks((prev) => [
        ...prev.slice(0, index + 1),
        newBlock,
        ...prev.slice(index + 1),
      ]);
      selectedBlockIdControl.setState(newBlock.id);
      hoveredBlockIdControl.setState(newBlock.id);
      setChanged(true);
    },
    [blocks]
  );

  return (
    <EditorContext.Provider
      value={{
        setInitialContent,
        updateBlockField,
        removeBlock,
        addBlock,
        selectNextBlock,
        selectPreviousBlock,
        blocks,
        setBlocks,
        duplicateBlock,
        moveBlock,
        selectedBlockIdControl,
        hoveredBlockIdControl,
        ready,
        setReady,
        errors,
        setErrors,
        changeState: {
          state: changed,
          setState: setChanged,
        },
        publicationState: {
          state: publicationStatus,
          setState: setPublicationStatus,
        },
        templates,
        setTemplates,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
};
