import { EditorApiService } from "@/components/LessonPageEditor/EditorApiService";
import { baseGenerateBlock } from "@/components/LessonPageEditor/baseGenerateBlock";
import { BluecardComponent, EmptyValuesWrapComponent } from "@/components/LessonPageEditor/types";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Log } from "@/utils/log";
import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { Alert, Field, Fieldset, Input } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { z } from "zod";
import BlockRenderEditButton from "../../BlockRenderEditButton";
import { AttachStaticImportButton, ImportButton } from "../../SideMenu";
import { ComponentFormBase, useComponentForm } from "../../form/ComponentFormBase";



type EmptySchema = EmptyValuesWrapComponent<BluecardComponent>
const defaultValues: EmptySchema = {
    "text": "Bluecard",
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
                    data: {
                        values: defaultValues,
                    },
                },
            } as any);
        },
        group: "Other",
    }),
    sideMenu: (props) => {
        return (
            <>
                <ImportButton<BluecardComponent>
                    {...props}
                    dialogProps={{
                        title: "Import",
                        type: "bluecard",
                        parseResponse: (response) => {
                            return response.results.map((item) => {
                                return {
                                    label: item.text,
                                    value: `${item.id}`,
                                };
                            });
                        },
                    }}
                    parseUpdateBlock={(result) => {
                        return {
                            content: result!.record.text,
                        };
                    }}
                />
                <AttachStaticImportButton<BluecardComponent>
                    {...props}
                    dialogProps={{
                        title: "Static Import",
                        type: "bluecard",
                        parseResponse: (response) => {
                            return response.results.map((item) => {
                                return {
                                    label: item.text,
                                    value: `${item.id}`,
                                };
                            });
                        },
                    }}
                    parseUpdateBlock={(result) => {
                        return {
                            content: result!.record.text,
                        };
                    }}
                />
            </>
        )
    },
    render: (props) => {
        const { actions, data } = props;
        const { obj, values } = data;
        const staticNotEditable = data.staticNotEditable || false;
        const renderData = values || obj as BluecardComponent;
        const handleDialogChange = useCallback(() => {
            actions.edit!.modal.show({
                recordId: data?.obj?.id!,
                block: props.block,
                editor: props.editor,
                contentRef: props.contentRef,
                actions: props.actions,
                updateBlockData: props.updateBlockData,
                data: props.data,
            }).then((res) => {
                const { record } = res.result;
                props.updateBlockData(props.block.id, {
                    data: {
                        obj: record,
                    },
                });
            }).catch((err) => {
                Log.error("handleDialogChange", err);
            });
        }, [data]);
        return (
            <>
                <Alert.Root position={"relative"} status="info" variant="subtle" className="bluecard-block">
                    <BlockRenderEditButton onClick={handleDialogChange} staticNotEditable={staticNotEditable} />
                    <Alert.Indicator />
                    <Alert.Title w={"full"}>
                        {renderData?.text}
                    </Alert.Title>
                </Alert.Root>
            </>
        );
    },
    initialValues: {
        default: defaultValues,
        empty: {
            text: "",
        },
    },
    actions: {
        edit: {
            type: "form",
            displayType: "drawer",
            render: (props) => {

                const modal = NiceModal.useModal();

                const schema = z.object({
                    text: z.string().min(5, "Text must be at least 5 characters"),
                });

                const mode = useMemo(() => (props.recordId ? "edit" : "create"), [props.recordId]);

                const formHook = useComponentForm<BluecardComponent, typeof schema>({
                    schema,
                    apiService: {
                        get: (id) => EditorApiService.fetchComponentDetail<BluecardComponent>("bluecard", id),
                        create: (data) => EditorApiService.createComponent<BluecardComponent>("bluecard", data),
                        update: (id, data) => EditorApiService.updateComponent<BluecardComponent>("bluecard", id, data),
                    },
                    mode,
                    recordId: props.recordId,
                    defaultValues: {
                        text: "",
                    },
                    onSuccess: (data) => {
                        modal.resolve({ modal, result: { record: data } });
                    },
                    queryKey: "bluecard",
                });

                return (
                    <ComponentFormBase<BluecardComponent, typeof schema>
                        formHook={formHook}
                        title="Bluecard Component"
                        modal={modal}
                        displayType="drawer"
                    >
                        {({ register, formState: { errors } }) => {
                            return (
                                <Fieldset.Root size="sm">
                                    <Field.Root invalid={!!errors.text}>
                                        <Field.Label>Text</Field.Label>
                                        <Input
                                            placeholder="Enter your text"
                                            {...register("text")}
                                            disabled={formHook.isProcessing}
                                            size="xs"
                                        />
                                        <Field.ErrorText>{errors.text?.message}</Field.ErrorText>
                                    </Field.Root>
                                </Fieldset.Root>
                            )
                        }}
                    </ComponentFormBase>
                )
            }
        },
    }
});