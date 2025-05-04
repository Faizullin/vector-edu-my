import { PaginatedData } from "@/client/types.gen";
import { baseGenerateBlock } from "@/components/LessonPageEditor/baseGenerateBlock";
import { BluecardComponent } from "@/components/LessonPageEditor/types";
import NiceModal, { NiceModalHandler } from "@/components/NiceModal/NiceModal";
import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { DragHandleMenuProps, useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import { Alert } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";

interface ShowProps<T> {
    modal: NiceModalHandler;
    result: {
        record: T;
    } | null;
}
const ImportButton = (props: DragHandleMenuProps) => {
    const Components = useComponentsContext()!;
    const editor = useBlockNoteEditor()
    return (
        <Components.Generic.Menu.Item
            onClick={() => {
                NiceModal.show<ShowProps<BluecardComponent>>("component-import-dialog", {
                    title: "Import",
                    type: "bluecard",
                    parseResponse: (response: PaginatedData<BluecardComponent>) => {
                        return response.results.map((item) => {
                            return {
                                label: item.text,
                                value: item.id,
                            };
                        });
                    }
                }).then(({ modal, result }) => {
                    if (result) {
                        modal.hide();
                        editor.updateBlock(props.block.id, {
                            content: result.record.text
                        });
                    }
                });
            }}>
            Import
        </Components.Generic.Menu.Item>
    );
}


export const BluecardBlock = baseGenerateBlock<BluecardComponent>({
    block: {
        type: "bluecard",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
        },
    },
    suggestionMenu: (editor) => ({
        title: "Bluecard",
        subtext: "Insert a bluecard",
        icon: <FiAlertCircle size={18} />,
        onItemClick: () => {
            insertOrUpdateBlock(editor, {
                type: "bluecard",
                props: {
                    textAlignment: "left",
                    textColor: "black",
                },
            } as any);
        },
        group: "Other",
    }),
    sideMenu: (props) => {
        return <>
            <ImportButton {...props}>Import</ImportButton>
        </>
    },
    render: (props) => {
        return (
            <Alert.Root status="info" variant="subtle" className="bluecard-block">
                <Alert.Indicator />
                <Alert.Title>
                    <div className={"inline-content"} ref={props.contentRef} />
                </Alert.Title>
            </Alert.Root>
        );
    },
});