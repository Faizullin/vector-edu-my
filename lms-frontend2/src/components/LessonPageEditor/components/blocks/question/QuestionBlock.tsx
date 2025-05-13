import { EditorApiService } from "@/components/LessonPageEditor/EditorApiService";
import { baseGenerateBlock } from "@/components/LessonPageEditor/baseGenerateBlock";
import { QuestionComponent } from "@/components/LessonPageEditor/types";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Log } from "@/utils/log";
import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { Box, Checkbox, Field, Fieldset, Flex, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { FiEdit2, FiHelpCircle } from "react-icons/fi";
import { LuPlus, LuTrash } from "react-icons/lu";
import { z } from "zod";
import { AttachStaticImportButton, ImportButton } from "../../SideMenu";
import { ComponentFormBase, useComponentForm } from "../../form/ComponentFormBase";


interface EmptySchema {
    text: string;
    answers: {
        text: string;
        is_correct: boolean;
    }[];
}
const defaultValues: EmptySchema = {
    "text": "Sample question?",
    "answers": [
        { "text": "Option A", "is_correct": false },
        { "text": "Option B", "is_correct": true },
    ],
}
export const QuestionBlock = baseGenerateBlock<QuestionComponent, EmptySchema>({
    block: {
        type: "question",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
        },
    },

    suggestionMenu: (editor) => ({
        title: "Question",
        subtext: "Insert a question with answers",
        icon: <FiHelpCircle size={18} />,
        onItemClick: () => {
            insertOrUpdateBlock(editor, {
                type: "question",
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
                <ImportButton<QuestionComponent>
                    {...props}
                    dialogProps={{
                        title: "Import Question",
                        type: "question",
                        parseResponse: (response) => {
                            return response.results.map((item) => ({
                                label: item.text,
                                value: `${item.id}`,
                            }));
                        },
                    }}
                    parseUpdateBlock={(result) => ({
                        content: result!.record,
                    })}
                />
                <AttachStaticImportButton<QuestionComponent>
                    {...props}
                    dialogProps={{
                        title: "Static Import",
                        type: "question",
                        parseResponse: (response) => {
                            return response.results.map((item) => ({
                                label: item.text,
                                value: `${item.id}`,
                            }));
                        },
                    }}
                    parseUpdateBlock={(result) => ({
                        content: result!.record,
                    })}
                />
            </>
        );
    },

    render: (props) => {
        const { actions, data } = props;
        const { obj, values } = data;
        const staticNotEditable = data.staticNotEditable || false;

        const renderData = values || obj as QuestionComponent;
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
            <Box w="full" position={"relative"} border="1px solid" borderColor="gray.200" borderRadius="md" p="4" bg="blue.50">
                <div style={{ display: "none" }} ref={props.contentRef} contentEditable={false} />
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    bg="blackAlpha.700"
                    p="2"
                    m="2"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={handleDialogChange}
                    _hover={{ bg: staticNotEditable ? "blackAlpha.500" : "blackAlpha.800" }}
                >
                    <FiEdit2 size={16} color="white" />
                </Box>
                <Text w="full">
                    {renderData.text}
                </Text>
                <VStack align="start" spaceY={1} mt={2}>
                    {renderData.answers.map((answer, i) => (
                        <Checkbox.Root key={i} value={answer.is_correct ? "yes" : "no"} readOnly={true}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>{answer.text}</Checkbox.Label>
                        </Checkbox.Root>
                    ))}
                </VStack>
            </Box>
        );
    },
    actions: {
        edit: {
            type: "form",
            displayType: "dialog",
            render: (props) => {
                const modal = NiceModal.useModal();

                const schema = z.object({
                    text: z.string().min(5, "Question must be at least 5 characters"),
                    answers: z
                        .array(
                            z.object({
                                text: z.string().min(1, "Answer text required"),
                                is_correct: z.boolean(),
                            })
                        )
                        .min(2, "At least 2 answers required"),
                });

                const mode = useMemo(() => (props.recordId ? "edit" : "create"), [props.recordId]);

                const formHook = useComponentForm<QuestionComponent, typeof schema>({
                    schema,
                    apiService: {
                        get: (id) => EditorApiService.fetchComponentDetail<QuestionComponent>("question", id),
                        create: (data) => EditorApiService.createComponent<QuestionComponent>("question", data),
                        update: (id, data) => EditorApiService.updateComponent<QuestionComponent>("question", id, data),
                    },
                    mode,
                    recordId: props.recordId,
                    defaultValues: {
                        text: "",
                        answers: [
                            { text: "", is_correct: false },
                            { text: "", is_correct: false },
                        ],
                    },
                    onSuccess: (data) => {
                        modal.resolve({ modal, result: { record: data } });
                    },
                    queryKey: "question",
                    reverseTransform(formData) {
                        return {
                            "text": formData.text,
                            "answers": formData.answers.map((answer) => ({
                                text: answer.text,
                                is_correct: answer.is_correct,
                            })),
                        } as any;
                    },
                });

                return (
                    <ComponentFormBase<QuestionComponent, typeof schema>
                        formHook={formHook}
                        title="Question Component"
                        modal={modal}
                    >
                        {({ register, formState: { errors }, control, setValue }) => {
                            const { fields, append, remove } = useFieldArray({
                                name: "answers",
                                control,
                            });
                            return (
                                <Fieldset.Root size="sm">
                                    <Field.Root invalid={!!errors.text}>
                                        <Field.Label>Question Text</Field.Label>
                                        <Input
                                            placeholder="Enter your question"
                                            {...register("text")}
                                            disabled={formHook.isProcessing}
                                            size="xs"
                                        />
                                        <Field.ErrorText>{errors.text?.message}</Field.ErrorText>
                                    </Field.Root>



                                    {fields.map((field, index) => (
                                        <Flex key={field.id} w="100%" gap={3} align="center">
                                            <Text>Answer {index + 1}</Text>
                                            <Field.Root invalid={!!errors.answers?.[index]?.text} flex="1" w={200}>
                                                <Input
                                                    size="xs"
                                                    placeholder="Answer text"
                                                    {...register(`answers.${index}.text`)}
                                                    disabled={formHook.isProcessing}
                                                />
                                                <Field.ErrorText>
                                                    {errors.answers?.[index]?.text?.message}
                                                </Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root w="auto">
                                                <Checkbox.Root mt={1} size="xs"
                                                    value={field.is_correct ? "yes" : "no"}
                                                    disabled={formHook.isProcessing} onChange={(e: any) => {
                                                        setValue(`answers.${index}.is_correct`, e.target.checked);
                                                    }}>
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control />
                                                    <Checkbox.Label>Correct</Checkbox.Label>
                                                </Checkbox.Root>
                                            </Field.Root>

                                            <IconButton
                                                aria-label="Remove answer"
                                                size="xs"
                                                variant="ghost"
                                                onClick={() => remove(index)}
                                                disabled={fields.length <= 2}
                                            >
                                                <LuTrash />
                                            </IconButton>
                                        </Flex>
                                    ))}

                                    <IconButton
                                        onClick={() => append({ text: "", is_correct: false })}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="blue"
                                    >
                                        <LuPlus />
                                    </IconButton>
                                </Fieldset.Root>
                            )
                        }}
                    </ComponentFormBase>
                )
            }
        }
    },
    initialValues: {
        default: defaultValues,
        empty: {
            "text": "",
            "answers": [],
        }
    }
});
