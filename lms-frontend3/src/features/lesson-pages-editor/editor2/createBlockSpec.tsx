import { useEditor } from "./context/editor-context";
import type {
  Block,
  BlockSpec,
  BlockSpecCreated,
  ComponentBase,
} from "./types";

export const createBlockSpec = <T extends ComponentBase>(
  props: BlockSpec<T>
): BlockSpecCreated<T> => {
  const WrappedRender = (componentProps: { block: Block<T> }) => {
    const { render } = props;
    const { updateBlockField } = useEditor();
    return render({ block: componentProps.block, updateBlockField });
  };
  return {
    render: WrappedRender,
    type: props.type,
    suggestionMenu: props.suggestionMenu,
    sideMenu: props.sideMenu,
    initialContent: props.initialContent,
    sidebar: props.sidebar,
  };
};
