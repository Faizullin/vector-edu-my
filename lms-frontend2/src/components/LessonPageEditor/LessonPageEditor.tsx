import { DocumentId, LessonPageDocument, PostDocument } from "@/client/types.gen";
import { Log } from "@/utils/log";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { BlockColorsItem, DragHandleMenu, DragHandleMenuProps, RemoveBlockItem, SideMenu, SideMenuController, SuggestionMenuController } from "@blocknote/react";
import { Button, Checkbox, Flex, Heading, Menu, Portal, Skeleton } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import NiceModal from "../NiceModal/NiceModal";
import ImportNiceDialog from "./components/ImportNiceDialog";
import LessonDemoDataNiceDialog from "./components/LessonDemoDataNiceDialog";
import ViewDataNiceDialog from "./components/ViewDataNiceDialog";
import { EditorApiService } from "./EditorApiService";
import schema from "./schema";


const CustomDragHandleMenu = (props: DragHandleMenuProps) => {
    const Menu = useMemo(() => {
        return schema.blocks.find(block => block.spec.config.type === props.block.type)?.options.sideMenu;
    }, [props.block]);
    return (
        <DragHandleMenu {...props}>
            <RemoveBlockItem {...props}>Delete</RemoveBlockItem>
            <BlockColorsItem {...props}>Colors</BlockColorsItem>
            {Menu && <Menu {...props} />}
        </DragHandleMenu>
    );
}

NiceModal.register('component-import-dialog', ImportNiceDialog);

interface Props {
    lessonPage: LessonPageDocument;
    post: PostDocument;
    laoding?: boolean;
}

const LessonPageEditor = ({ post, laoding }: Props) => {
    const [initialContent, setInitialContent] = useState<any[] | null>(null);
    const loadQuery = useMutation({
        mutationFn: (postId: string) => EditorApiService.loadContent(postId),
        mutationKey: ["loadContent",]
    });
    const [ignoreParagraphMode, setIgnoreParagraphMode] = useState(false);
    const editor = useMemo(() => {
        if (initialContent === null) {
            return null;
        }
        return BlockNoteEditor.create({ initialContent, schema: schema.schema });
    }, [initialContent,]);
    const saveMuatation = useMutation({
        mutationFn: (content: string) => EditorApiService.saveContent(`${post.id}`, content),
        mutationKey: ["saveContent",],
    });
    const publichMutation = useMutation({
        mutationFn: (content: string) => {
            return EditorApiService.publishContent(`${post.id}`, content);
        },
        mutationKey: ["publishContent",],
    });
    const loadDemoMutation = useMutation({
        mutationFn: (postId: DocumentId) => EditorApiService.fetchLoadDemoLessonData(postId),
        mutationKey: ["loadDemoContent",],
    });
    const handleSave = useCallback(() => {
        const content = JSON.stringify(editor!.document);
        saveMuatation.mutateAsync(content);
    }, [saveMuatation, editor])
    const handlePublish = useCallback(() => {
        const content = JSON.stringify(editor!.document);
        publichMutation.mutateAsync(content);
    }, [publichMutation, editor])
    const handleLoadDemoData = useCallback(() => {
        loadDemoMutation.mutateAsync(post.id).then((response) => {
            NiceModal.show(LessonDemoDataNiceDialog, {
                lesson_page_data: response.data.lesson_page,
            });
        });
    }, [post.id, loadDemoMutation])
    useEffect(() => {
        loadQuery.mutateAsync(`${post.id}`).then((response) => {
            let content = null;
            try {
                if (response.data.content) {
                    content = JSON.parse(response.data.content)
                } else {
                    content = [{
                        type: "paragraph",
                        content: "Welcome to this demo!. Print '/' (slash) to see blocks.",
                    },
                    ];
                }
            } catch (e) {
                Log.error(e);
            }
            if (content !== null) {
                setInitialContent(content);
            }
        });
    }, []);
    const handleViewData = useCallback(() => {
        NiceModal.show(ViewDataNiceDialog, {
            content: editor!.document,
        })
    }, [editor]);
    return (
        <>
            <Flex
                mb={8}
                alignItems="center"
                justifyContent="space-between"
            >
                <Skeleton asChild loading={laoding}>
                    <Heading size="sm">
                        {post.title}
                    </Heading>
                </Skeleton>
                <Flex>
                    <Checkbox.Root
                        value={ignoreParagraphMode ? "true" : "false"}
                        onCheckedChange={(value) => {
                            const newValue = value.checked === "indeterminate" ? false : value.checked;
                            setIgnoreParagraphMode(newValue);
                        }}
                        size="xs" colorScheme="blue">
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>Ignore Paragraph</Checkbox.Label>
                    </Checkbox.Root>
                    <Button
                        ml={1}
                        size="xs"
                        variant="solid"
                        onClick={handleSave}
                        disabled={saveMuatation.isPending}
                    >
                        Save
                    </Button>
                    <Button
                        ml={1}
                        size="xs"
                        variant="solid"
                        onClick={handlePublish}
                        disabled={publichMutation.isPending}
                    >
                        Publish
                    </Button>
                    <Menu.Root size={"sm"} onSelect={(value) => {
                        if (value.value === "load-demo-data") {
                            handleLoadDemoData();
                        } else if (value.value === "view-blocks-data") {
                            handleViewData();
                        }
                    }}>
                        <Menu.Trigger asChild>
                            <Button variant="solid" size="xs" ml={1}>
                                Actions
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Menu.Item value="load-demo-data" disabled={loadDemoMutation.isPending}>
                                        Show Demo Data
                                    </Menu.Item>
                                    <Menu.Item value="view-blocks-data">
                                        View Data
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Flex>
            </Flex>
            {
                editor === null ? (
                    <Skeleton height={500} width="100%" />
                ) : (

                    <BlockNoteView editor={editor} slashMenu={false} sideMenu={false}
                    // formattingToolbar={false} filePanel={false}
                    >
                        <SuggestionMenuController
                            triggerCharacter={"/"}
                            getItems={async (query) =>
                                filterSuggestionItems(schema.getCustomSlashMenuItems(editor as any), query)
                            }
                        />
                        <SideMenuController
                            sideMenu={(props) => {
                                return (
                                    <SideMenu {...props} dragHandleMenu={CustomDragHandleMenu} />
                                )
                            }}
                        />
                        {/* <FilePanelController filePanel={UppyFilePanel} /> 
              <FormattingToolbarController
                formattingToolbar={(props) => {
                    // Replaces default file replace button with one that opens Uppy.
                    const items = getFormattingToolbarItems();
                    items.splice(
                        items.findIndex((c) => c.key === "replaceFileButton"),
                        1,
                        <FileReplaceButton key={"fileReplaceButton"} />
                    );

                    return <FormattingToolbar {...props}>{items}</FormattingToolbar>;
                }}
            />
            <FilePanelController filePanel={UppyFilePanel} /> */}
                    </BlockNoteView>
                )
            }
        </>
    );
}

export default LessonPageEditor;