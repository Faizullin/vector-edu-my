import MultiselectLinkInput from "@/components/form/MultiselectLinkInput";
import NiceModal, { NiceModalHandler } from "@/components/NiceModal/NiceModal";
import { DragHandleMenuProps, useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import { ComponentProps } from "react";

interface ShowProps<T> {
    modal: NiceModalHandler;
    result: {
        record: T;
    } | null;
}

interface ImportButtonProps<T> extends DragHandleMenuProps {
    dialogProps?: {
        title: string;
        type: string;
        parseResponse: ComponentProps<typeof MultiselectLinkInput<T>>["parseResponse"];
    };
    parseUpdateBlock?: (props: ShowProps<T>["result"]) => any;
}

export const ImportButton = <T,>(props: ImportButtonProps<T>) => {
    const Components = useComponentsContext()!;
    const editor = useBlockNoteEditor()
    return (
        <Components.Generic.Menu.Item
            onClick={() => {
                NiceModal.show<ShowProps<T>>("component-import-dialog", props.dialogProps).then(({ modal, result }) => {
                    if (result) {
                        modal.hide();
                        const tmp = props.parseUpdateBlock?.(result) || {};
                        editor.updateBlock(props.block.id, {
                            props: {
                                data: {
                                    obj: result.record,
                                }
                            },
                            ...tmp,
                        });
                    }
                });
            }}>
            Import
        </Components.Generic.Menu.Item>
    );
}
