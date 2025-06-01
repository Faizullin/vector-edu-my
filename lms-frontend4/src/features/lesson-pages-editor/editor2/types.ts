import type {
  DocumentBase,
  DocumentId,
  FieldItem,
  PaginatedData,
} from "@/types";
import type { JSX } from "react";

export type BlockIdentifier = string;

export type ComponentBase = DocumentBase;

export interface BlockDataField<T extends ComponentBase = ComponentBase> {
  obj: T | null;
  values: Partial<Omit<T, "id">>;
  static?: boolean;
  element_id?: DocumentId;
}
export interface Block<T extends ComponentBase = ComponentBase> {
  id: BlockIdentifier;
  type: string;
  data: BlockDataField<T>;
}
export interface SaveDataJsonType {
  date: Date;
  blocks: Block[];
}
export type UpdateBlockFieldFn<T extends ComponentBase = ComponentBase> = (
  blockId: BlockIdentifier,
  data: BlockDataField<T>
) => void;
export interface BlockSpec<T extends ComponentBase> {
  type: string;
  render: (props: {
    block: Block<T>;
    updateBlockField: UpdateBlockFieldFn<T>;
  }) => JSX.Element;
  suggestionMenu: (props: {
    addBlock: (type: string, afterId?: BlockIdentifier) => void;
  }) => {
    title: string;
    subtext: string;
    icon: (props: any) => JSX.Element;
    onItemClick: () => void;
  };
  sideMenu: () => {
    title: string;
    parseSearchResponse: (response: PaginatedData<T>) => FieldItem[];
    parseObjToValues: (obj: T) => any;
  };
  initialContent: {
    empty: Partial<Omit<ComponentBase, "id">>;
    default?: Partial<Omit<ComponentBase, "id">>;
  };
  sidebar?: {
    render: (props: {
      block: Block<T>;
      updateBlockField: UpdateBlockFieldFn<T>;
    }) => JSX.Element;
  };
}
export interface BlockSpecCreated<T extends ComponentBase>
  extends BlockSpec<T> {
  render: (props: { block: Block<T> }) => JSX.Element;
}

export interface BlockError {
  block_id: BlockIdentifier;
  error: string;
}
