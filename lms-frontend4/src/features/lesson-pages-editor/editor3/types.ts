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
  template_id?: DocumentId;
}
export interface Block<T extends ComponentBase = ComponentBase> {
  id: BlockIdentifier;
  type: string;
  data: BlockDataField<T>;
}
export interface TemplateDocument extends DocumentBase {
  name: string;
  content: string;
  block_id: BlockIdentifier;
  component_type: string;
  created_at: string;
  updated_at: string;
}
export interface AttachmentDocument extends DocumentBase {
  attachment_type: "file" | "thumbnail_image";
  content_type: string;
  object_id: DocumentId;
  name: string;
  original_name: string;
  // exstions for media: image, video, audio
  extension: ".jpg" | ".png" | ".gif" | ".jpeg" | ".webp" | ".svg" | ".mp4" | ".webm" | ".mp3" | ".wav";
  alt: string;
  url: string;
  size: number; // in bytes
  file_type: "image" | "video" | "audio" | "document" | "other";
  file: string;
  uploaded_at: string; // ISO date string
  storage_engine: "protected-local" | "local";
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

