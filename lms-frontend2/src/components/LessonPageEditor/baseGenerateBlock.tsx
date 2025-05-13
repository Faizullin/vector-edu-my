import {
  BlockNoteEditor,
  CustomBlockConfig,
  InlineContentSchema,
  PartialBlockFromConfig,
  PropSpec,
  StyleSchema,
} from "@blocknote/core";
import {
  createReactBlockSpec,
  DefaultReactSuggestionItem,
  DragHandleMenuProps,
  ReactCustomBlockImplementation,
  ReactCustomBlockRenderProps,
} from "@blocknote/react";
import { ComponentProps, FC, ReactNode } from "react";
import NiceModal, { NiceModalHocProps } from "../NiceModal/NiceModal";
import { ComponentBase, ComponentId, EmptyValuesWrapComponent } from "./types";

// ==========================================
// Types
// ==========================================

type DataFieldType<ComponentModel> = {
  obj: ComponentModel | null;
  values?: EmptyValuesWrapComponent<ComponentModel>;
  staticNotEditable?: boolean;
}

type EditDialogProps = {
  recordId?: ComponentId;
} & NiceModalHocProps;

type DisplayRenderPropsType<
  ComponentModel,
  I extends InlineContentSchema,
  S extends StyleSchema,> = ReactCustomBlockRenderProps<CustomBlockConfig, I, S> & {
    actions: {
      edit?: {
        modal: {
          show: (props: DisplayRenderPropsType<ComponentModel, I, S> & Partial<EditDialogProps>) => Promise<{
            result: {
              record: ComponentModel | null;
            };
          }>;
        };
      }
    },
    data: DataFieldType<ComponentModel>;
    updateBlockData: (
      blockToUpdate: Parameters<ReactCustomBlockRenderProps<CustomBlockConfig, I, S>["editor"]["updateBlock"]>[0],
      data: {
        data: DataFieldType<ComponentModel>;
        contentParseFn?: (data: DataFieldType<ComponentModel>) => string;
      },
    ) => ReturnType<ReactCustomBlockRenderProps<CustomBlockConfig, I, S>["editor"]["updateBlock"]>;
  }

type ActionRenderType<
  ComponentModel,
  I extends InlineContentSchema,
  S extends StyleSchema,> = Record<string, {
    type: "form",
    displayType: "dialog",
    render: FC<
      DisplayRenderPropsType<ComponentModel, I, S> & EditDialogProps
    >;
  } | {
    type: "form",
    displayType: "drawer",
    render: FC<
      DisplayRenderPropsType<ComponentModel, I, S> & EditDialogProps
    >;
  }>;


type BlockOptions<
  ComponentModel,
  ValuesSchema,
  I extends InlineContentSchema,
  S extends StyleSchema,
> = {
  block: {
    type: string;
    content?: "inline" | "none";
    propSchema?: Partial<Record<string, PropSpec<any>>>;
  };
  menu?: {
    title: string;
    subtext?: string;
    icon?: ReactNode;
  };
  suggestionMenu?: (editor: BlockNoteEditor) => DefaultReactSuggestionItem;
  sideMenu?: (props: DragHandleMenuProps) => JSX.Element;
  render: FC<DisplayRenderPropsType<ComponentModel, I, S>>;
  toExternalHTML?: FC<ReactCustomBlockRenderProps<CustomBlockConfig, I, S>>;
  parse?: (
    el: HTMLElement
  ) => PartialBlockFromConfig<CustomBlockConfig, I, S>["props"] | undefined;
  actions?: ActionRenderType<ComponentModel, I, S>;
  apiSynced?: boolean;
  parsePublishFn?: (block: {
    type: string;
    content?: "inline" | "none";
    propSchema?: Partial<Record<string, PropSpec<any>>>;
  }) => {
    sync?: boolean;
    obj: ComponentModel;
    formDat: Record<string, any>;
  },
  initialValues: {
    default?: ValuesSchema;
    empty: ValuesSchema;
  }
};

// ==========================================
// Factory Function
// ==========================================
export function baseGenerateBlock<
  ComponentModel extends ComponentBase,
  ValuesSchema = EmptyValuesWrapComponent<ComponentModel>,
  I extends InlineContentSchema = InlineContentSchema,
  S extends StyleSchema = StyleSchema
>(options: BlockOptions<ComponentModel, ValuesSchema, I, S>) {
  const { block, render, toExternalHTML, parse, suggestionMenu, actions } = options;

  const fullSchema = {
    ...(block.propSchema || {}),
    data: {
      default: {
        obj: null as ComponentModel | null,
      },
    },
  } as Record<string, PropSpec<any>>;

  const config: CustomBlockConfig = {
    type: block.type,
    content: block.content || "inline",
    propSchema: fullSchema,
    ...(suggestionMenu && { suggestionMenu }),
  };

  const dialogRenderActions: Record<string, any> = {}
  Object.keys(actions || {}).forEach((key) => {
    const action = actions?.[key];
    if (action?.type === "form" && (action?.displayType === "dialog" || action?.displayType === "drawer")) {
      const tmpDialog = NiceModal.create<DisplayRenderPropsType<ComponentModel, I, S> & EditDialogProps>(action.render);
      dialogRenderActions[key] = {
        type: action.type,
        displayType: action.displayType,
        modal: {
          show: (props: any) => {
            return NiceModal.show<{
              result: {
                record: ComponentModel | null;
              }
            }, any, any>(
              tmpDialog,
              {
                ...props,
                recordId: props.recordId,
              }
            )
          }
        },
      }
    }
  });

  const newActionsProps = {
    ...dialogRenderActions,
  }


  const WrappedRender: FC<ReactCustomBlockRenderProps<CustomBlockConfig, I, S>> = (props) => {
    const data = (props.block.props as any).data as { obj: ComponentModel | null };
    const updateBlockData: ComponentProps<BlockOptions<ComponentModel, EmptyValuesWrapComponent<ComponentModel>, I, S>["render"]>['updateBlockData'] = (blockToUpdate, dataProps) => {
      const saveData = ({
        props: {
          data: dataProps.data,
        },
      } as any)
      if (dataProps.contentParseFn) {
        saveData.content = dataProps.contentParseFn(dataProps.data);
      }
      return props.editor.updateBlock(blockToUpdate, saveData);
    }
    return render({ ...props, actions: newActionsProps, data, updateBlockData });
  };

  const implementation: ReactCustomBlockImplementation<CustomBlockConfig, I, S> = {
    render: WrappedRender,
    ...(toExternalHTML && { toExternalHTML }),
    ...(parse && { parse }),
  };



  return {
    spec: createReactBlockSpec(config, implementation),
    options,
  };
}
