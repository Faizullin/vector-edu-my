import { baseGenerateBlock } from "@/components/LessonPageEditor/baseGenerateBlock";
import { EditorApiService } from "@/components/LessonPageEditor/EditorApiService";
import { VideoComponent } from "@/components/LessonPageEditor/types";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Log } from "@/utils/log";
import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { AspectRatio, Box, Field, Fieldset, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { FiAlertCircle, FiEdit2, FiVideo } from "react-icons/fi";
import { LuExternalLink } from "react-icons/lu";
import { z } from "zod";
import { ComponentFormBase, useComponentForm } from "../../form/ComponentFormBase";
import { AttachStaticImportButton, DetachObjectButton, ImportButton } from "../../SideMenu";


interface EmptySchema {
    description: string;
    video_url: string;
}
const defaultValues: EmptySchema = {
    "description": "Sample video description",
    "video_url": "",
}
export const VideoBlock = baseGenerateBlock<VideoComponent, EmptySchema>({
    block: {
        type: "video",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
        },
    },
    suggestionMenu: (editor) => ({
        title: "Video",
        subtext: "Insert a video",
        icon: <FiAlertCircle size={18} />,
        onItemClick: () => {
            insertOrUpdateBlock(editor, {
                type: "video",
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
                <ImportButton<VideoComponent>
                    {...props}
                    dialogProps={{
                        title: "Import",
                        type: "video",
                        parseResponse: (response) => {
                            return response.results.map((item) => {
                                return {
                                    label: item.description,
                                    value: `${item.id}`,
                                };
                            });
                        },
                    }}
                    parseUpdateBlock={(result) => {
                        return {
                            content: result!.record.description,
                        };
                    }}
                />
                <AttachStaticImportButton<VideoComponent>
                    {...props}
                    dialogProps={{
                        title: "Static Import",
                        type: "video",
                        parseResponse: (response) => {
                            return response.results.map((item) => {
                                return {
                                    label: item.description,
                                    value: `${item.id}`,
                                };
                            });
                        },
                    }}
                    parseUpdateBlock={(result) => {
                        return {
                            content: result!.record.description,
                        };
                    }}
                />
                <DetachObjectButton<VideoComponent>
                    {...props}
                />
            </>
        )
    },
    render: (props) => {
        const { data, actions } = props;
        const videoUrl = useMemo(() => {
            if (data.obj?.embedded_video_url) {
                return data.obj.embedded_video_url;
            }
            return undefined;
        }, [data]);
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
                    contentParseFn(data) {
                        return data.obj?.description || "";
                    },
                    data: {
                        obj: record,
                    },
                });
            }).catch((err) => {
                Log.error("handleDialogChange", err);
            });
        }, [data]);
        const staticNotEditable = data.staticNotEditable || false;
        return (
            <Box
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                border="1px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.700", bg: "gray.800" }}
                bg="white"
                mb={4}
                className="video-block"
                w="100%"
            >
                {videoUrl ? (
                    <Box position="relative" overflow="hidden">
                        <AspectRatio ratio={16 / 9}
                            height="200px">
                            <iframe
                                src={videoUrl}
                                title={props.block.props.description || "Video"}
                                allowFullScreen
                            />
                        </AspectRatio>
                        <Box
                            position="absolute"
                            top="0"
                            right="0"
                            bg="blackAlpha.700"
                            p="2"
                            m="2"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: "blackAlpha.800" }}
                            onClick={handleDialogChange}
                        >
                            <FiEdit2 size={16} color="white" />
                        </Box>
                    </Box>
                ) : (
                    <Flex
                        _dark={{ bg: "gray.700" }}
                        height="200px"
                        alignItems="center"
                        justifyContent="center"
                        borderTopRadius="lg"
                        _hover={{ opacity: 0.8 }}
                        transition="background 0.2s"
                        onClick={handleDialogChange}
                        cursor={staticNotEditable ? "not-allowed" : "pointer"}
                        pointerEvents={staticNotEditable ? "none" : "auto"}
                        bg={staticNotEditable ? "gray.200" : "gray.100"}
                    >
                        <Stack align="center" spaceX={2} spaceY={2}>
                            <FiVideo size={40} color="gray" />
                            <Text color="gray.500" fontSize="sm">Click to add a video</Text>
                        </Stack>
                    </Flex>
                )}

                <Stack spaceY={3} p={4}>
                    <div className="inline-content" ref={props.contentRef} contentEditable={!staticNotEditable} />
                    {!videoUrl && (
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            fontStyle="italic"
                        >
                            Click "Import Video" in the side menu to add a video
                        </Text>
                    )}
                </Stack>
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
                    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
                    video_url: z.string().url('Invalid URL').min(10, 'URL must be at least 10 characters').max(1000),
                });
                const mode = useMemo(() => {
                    return props.recordId ? 'edit' : 'create';
                }, [props.recordId]);
                const formHook = useComponentForm<VideoComponent, typeof schema>({
                    schema: schema,
                    apiService: {
                        get: (id) => EditorApiService.fetchComponentDetail<VideoComponent>('video', id),
                        create: (data) => EditorApiService.createComponent<VideoComponent>('video', data),
                        update: (id, data) => EditorApiService.updateComponent<VideoComponent>('video', id, data),
                    },
                    mode,
                    recordId: props.recordId,
                    defaultValues: {
                        description: '',
                        video_url: '',
                    },
                    onLoadSuccess: (data) => {
                        const embeddedVideoUrl = data.embedded_video_url;
                        const incorrectVideoUrl = (!embeddedVideoUrl) || (embeddedVideoUrl.startsWith('https://dummylink.dummy'));
                        if (incorrectVideoUrl) {
                            formHook.form.setError('video_url', {
                                type: "manual",
                                message: "Invalid video URL or not accesibly by service",
                            });
                        }
                    },
                    onSuccess: (data, _) => {
                        modal.resolve({
                            modal,
                            result: {
                                record: data,
                            },
                        });
                    },
                    queryKey: 'video',
                });
                return (
                    <ComponentFormBase<VideoComponent, typeof schema>
                        formHook={formHook}
                        title="Video Component"
                        modal={modal}
                    >
                        {({ register, formState: { errors } }) => (
                            <>
                                <Fieldset.Root size="sm">
                                    <Field.Root invalid={!!errors.video_url}>
                                        <Flex w="100%" justifyContent="space-between" alignItems="center">
                                            <Field.Label>Video Url</Field.Label>
                                            {
                                                formHook.initialData && (
                                                    <a href={formHook.initialData.embedded_video_url} target="_blank" color="blue.500">
                                                        <Flex align={"center"}>
                                                            <Text fontSize="xs" mr={2}>
                                                                View
                                                            </Text>
                                                            <LuExternalLink />
                                                        </Flex>
                                                    </a>
                                                )
                                            }
                                        </Flex>
                                        <Input placeholder="Enter vimeo url" {...register('video_url')} disabled={formHook.isProcessing} size="xs" />
                                        <Field.ErrorText>{errors.video_url?.message}</Field.ErrorText>
                                    </Field.Root>
                                    <Field.Root invalid={!!errors.description}>
                                        <Field.Label>Description</Field.Label>
                                        <Input placeholder="Enter description" {...register('description')} disabled={formHook.isProcessing} size="xs" />
                                        <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
                                    </Field.Root>
                                </Fieldset.Root>
                            </>
                        )}
                    </ComponentFormBase>
                );
            }
        },
    },
    initialValues: {
        default: defaultValues,
        empty: {
            description: "",
            video_url: "",
        },
    }
});
