import { baseGenerateBlock } from "@/components/LessonPageEditor/baseGenerateBlock";
import { EditorApiService } from "@/components/LessonPageEditor/EditorApiService";
import { ImageComponent } from "@/components/LessonPageEditor/types";
import { getProtectedStorageUrl } from "@/components/LessonPageEditor/utils";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Log } from "@/utils/log";
import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { AspectRatio, Box, Button, Code, Field, Fieldset, FileUpload, Flex, Float, Input, Stack, Text, useFileUpload, useFileUploadContext } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { FiAlertCircle, FiEdit2, FiImage } from "react-icons/fi";
import { LuExternalLink, LuFileImage, LuX } from "react-icons/lu";
import { z } from "zod";
import { ComponentFormBase, useComponentForm } from "../../form/ComponentFormBase";
import { AttachStaticImportButton, DetachObjectButton, ImportButton } from "../../SideMenu";

const FileUploadList = () => {
    const fileUpload = useFileUploadContext()
    const files = fileUpload.acceptedFiles
    if (files.length === 0) return null
    return (
        <FileUpload.ItemGroup>
            {files.map((file) => (
                <FileUpload.Item
                    w="auto"
                    boxSize="20"
                    p="2"
                    file={file}
                    key={file.name}
                >
                    <FileUpload.ItemPreviewImage />
                    <Float placement="top-end">
                        <FileUpload.ItemDeleteTrigger boxSize="4" layerStyle="fill.solid">
                            <LuX />
                        </FileUpload.ItemDeleteTrigger>
                    </Float>
                </FileUpload.Item>
            ))}
        </FileUpload.ItemGroup>
    )
}


export const ImageBlock = baseGenerateBlock<ImageComponent>({
    block: {
        type: "image",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
        },
    },
    suggestionMenu: (editor) => ({
        title: "Image",
        subtext: "Insert a image",
        icon: <FiAlertCircle size={18} />,
        onItemClick: () => {
            insertOrUpdateBlock(editor, {
                type: "image",
                props: {
                    textAlignment: "left",
                    textColor: "black",
                    data: {
                        values: {
                            description: "Sample image",
                            image: null,
                        },
                    },
                },
            } as any);
        },
        group: "Other",
    }),
    sideMenu: (props) => {
        return (
            <>
                <ImportButton<ImageComponent>
                    {...props}
                    dialogProps={{
                        title: "Import",
                        type: "image",
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
                <AttachStaticImportButton<ImageComponent>
                    {...props}
                    dialogProps={{
                        title: "Static Import",
                        type: "image",
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
                <DetachObjectButton<ImageComponent>
                    {...props}
                />
            </>
        )
    },
    render: (props) => {
        const { data, actions } = props;
        const imageUrl = useMemo(() => {
            if (data.obj?.image) {
                return getProtectedStorageUrl(data.obj.image.url);
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
                        values: record ? {
                            description: record.description,
                            image: record.image,
                        } : undefined,
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
                className="image-block"
                w="100%"
            >
                {imageUrl ? (
                    <Box position="relative" overflow="hidden">
                        <AspectRatio ratio={16 / 9} height="200px">
                            <img
                                src={imageUrl}
                                alt={props.block.props.description || "Image"}
                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
                            <FiImage size={40} color="gray" />
                            <Text color="gray.500" fontSize="sm">Click to add a image</Text>
                        </Stack>
                    </Flex>
                )}

                <Stack spaceY={3} p={4}>
                    <div className="inline-content" ref={props.contentRef} contentEditable={!staticNotEditable} />
                    {!imageUrl && (
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            fontStyle="italic"
                        >
                            Click "Import Image" in the side menu to add a image
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
                    image_file: z.any().optional(),
                });
                const mode = useMemo(() => {
                    return props.recordId ? 'edit' : 'create';
                }, [props.recordId]);
                const formHook = useComponentForm<ImageComponent, typeof schema>({
                    schema: schema,
                    apiService: {
                        get: (id) => EditorApiService.fetchComponentDetail<ImageComponent>('image', id),
                        create: (data) => EditorApiService.createComponent<ImageComponent>('image', data),
                        update: (id, data) => EditorApiService.updateComponent<ImageComponent>('image', id, data),
                    },
                    mode,
                    recordId: props.recordId,
                    defaultValues: {
                        description: '',
                        image_file: null,
                    },
                    onSuccess: (data, _) => {
                        modal.resolve({
                            modal,
                            result: {
                                record: data,
                            },
                        });
                    },
                    queryKey: 'image',
                    reverseTransform(formData) {
                        const newFormData = new FormData();
                        newFormData.append('description', formData.description);
                        newFormData.append('image_file', formData.image_file);
                        return formData;
                    },
                });
                const fileUpload = useFileUpload({
                    maxFiles: 1,
                    maxFileSize: 5 * 1024 * 1024, // 5MB
                    accept: {
                        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
                    },
                })
                useEffect(() => {
                    if (fileUpload.acceptedFiles.length > 0) {
                        formHook.form.setValue("image_file", fileUpload.acceptedFiles[0]);
                    }
                }, [fileUpload.acceptedFiles]);
                const accepted = fileUpload.acceptedFiles.map((file) => file.name)
                const rejected = fileUpload.rejectedFiles.map((e) => e.file.name)
                return (
                    <ComponentFormBase<ImageComponent, typeof schema>
                        formHook={formHook}
                        title="Image Component"
                        modal={modal}
                    >
                        {({ register, formState: { errors } }) => (
                            <>
                                <Fieldset.Root size="sm">
                                    <Field.Root invalid={!!errors.image_file}>
                                        <Flex w="100%" justifyContent="space-between" alignItems="center">
                                            <FileUpload.RootProvider value={fileUpload}>
                                                <FileUpload.HiddenInput />
                                                <FileUpload.Trigger asChild>
                                                    <Button variant="outline" size="xs">
                                                        <LuFileImage /> Upload Image
                                                    </Button>
                                                </FileUpload.Trigger>
                                                <FileUploadList />
                                            </FileUpload.RootProvider>
                                            {
                                                formHook.initialData?.image && (
                                                    <a href={formHook.initialData.image.url} target="_blank" color="blue.500">
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
                                        {
                                            accepted.length > 0 && (
                                                <Code colorPalette="green">accepted: {accepted.join(", ")}</Code>
                                            )
                                        }
                                        {
                                            rejected.length > 0 && (
                                                <Code colorPalette="red">rejected: {rejected.join(", ")}</Code>
                                            )
                                        }
                                        <Field.ErrorText>{errors.image_file?.message?.toString()}</Field.ErrorText>
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
        empty: {
            description: "",
            image: null,
        }
    }
});
