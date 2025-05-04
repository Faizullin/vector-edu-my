import {
  BlockNoteEditor,
  InlineContentSchema,
  PartialBlockFromConfig,
  PropSpec,
  StyleSchema
} from "@blocknote/core";
import {
  createReactBlockSpec,
  DefaultReactSuggestionItem,
  DragHandleMenuProps,
  ReactCustomBlockImplementation,
  ReactCustomBlockRenderProps,
} from "@blocknote/react";
import { FC, ReactNode } from "react";
import { NiceModalHocProps } from "../NiceModal/NiceModal";
import { ComponentBase, ComponentId } from "./types";

type ComponentEditFormType = {
  type: "dialog";
  render: (props: { title: string, recordId?: ComponentId } & NiceModalHocProps) => JSX.Element;
}

type PropSchema<ComponentModel> = {
  data: {
    obj: ComponentModel | null;
  };
} & Record<string, PropSpec<boolean | number | string>>

type FileBlockConfig<ComponentModel> = {
  type: string;
  readonly propSchema: PropSchema<ComponentModel> & {
    caption: {
      default: "";
    };
    name: {
      default: "";
    };
    url?: {
      default: "";
    };
    showPreview?: {
      default: boolean;
    };
    previewWidth?: {
      default: number;
    };
  };
  content: "none";
  isSelectable?: boolean;
  isFileBlock: true;
  fileBlockAccept?: string[];
};
type BlockConfig<ComponentModel> = {
  type: string;
  readonly propSchema: PropSchema<ComponentModel>;
  content: "inline" | "none" | "table";
  isSelectable?: boolean;
  isFileBlock?: false;
  hardBreakShortcut?: "shift+enter" | "enter" | "none";
} | FileBlockConfig<ComponentModel>;


type CustomBlockConfig<ComponentModel> = BlockConfig<ComponentModel> & {
  content: "inline" | "none";
};


// =============================
// 🧱 Options Interface
// =============================
type BlockOptions<
  ComponentModel extends ComponentBase,
  T extends CustomBlockConfig<ComponentModel>,
  I extends InlineContentSchema,
  S extends StyleSchema
> = {
  block: {
    type: T["type"];
    content?: T["content"];
    propSchema?: Partial<Omit<T["propSchema"], "data">>;
  };
  menu?: {
    title: string;
    subtext?: string;
    icon?: ReactNode;
  };
  suggestionMenu?: (editor: BlockNoteEditor) => DefaultReactSuggestionItem;
  sideMenu?: (props: DragHandleMenuProps) => JSX.Element;
  render: FC<ReactCustomBlockRenderProps<CustomBlockConfig<ComponentModel>, I, S>>;
  toExternalHTML?: FC<ReactCustomBlockRenderProps<T, I, S>>;
  parse?: (el: HTMLElement) => PartialBlockFromConfig<T, I, S>["props"] | undefined;
  componentEditForm?: ComponentEditFormType;
};

// =============================
// 🏗️ Block Factory
// =============================
export function baseGenerateBlock<
  ComponentModel extends ComponentBase,
  T extends CustomBlockConfig<ComponentModel> = CustomBlockConfig<ComponentModel>,
  I extends InlineContentSchema = InlineContentSchema,
  S extends StyleSchema = StyleSchema
>(options: BlockOptions<ComponentModel, T, I, S>) {
  const {
    block,
    render,
    toExternalHTML,
    parse,
    suggestionMenu,
  } = options;

  // Enforce presence of data.obj field with generic Model
  const fullSchema: T["propSchema"] = {
    ...(block.propSchema || {}),
    data: {
      default: {
        obj: null as ComponentModel | null,
      },
    },
  } as unknown as T["propSchema"];

  const config: T = {
    type: block.type,
    content: block.content || "inline",
    propSchema: fullSchema,
    ...(suggestionMenu && { suggestionMenu }),
  } as T;

  const implementation: ReactCustomBlockImplementation<T & any, I, S> = {
    render,
    ...(toExternalHTML && { toExternalHTML }),
    ...(parse && { parse }),
  };

  return {
    spec: createReactBlockSpec(config, implementation),
    options,
  }
}
