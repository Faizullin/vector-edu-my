import { LessonPageDocument, PostDocument } from "@/client/types.gen";
import { Log } from "@/utils/log";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { BlockColorsItem, DragHandleMenu, DragHandleMenuProps, RemoveBlockItem, SideMenu, SideMenuController, SuggestionMenuController } from "@blocknote/react";
import { Button, Flex, Heading, Skeleton } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorApiService } from "./EditorApiService";
import schema from "./schema";
import NiceModal from "../NiceModal/NiceModal";
import ImportNiceDialog from "./components/ImportNiceDialog";


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
    // lesson: {
    //     id: string;
    //     title: string;
    //     content: string;
    // };
    lessonPage: LessonPageDocument;
    post: PostDocument;
    laoding?: boolean;
}

const LessonPageEditor = ({ post, laoding }: Props) => {
    const [initialContent, setInitialContent] = useState<any[] | null>(null);
    // const editor = useCreateBlockNote({
    //     schema: schema.schema,
    //     initialContent,
    // })
    const loadQuery = useMutation({
        mutationFn: (postId: string) => EditorApiService.loadContent(postId),
        mutationKey: ["loadContent",]
    });
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
    const handleSave = useCallback(() => {
        const content = JSON.stringify(editor!.document);
        saveMuatation.mutateAsync(content);
    }, [saveMuatation, editor])
    useEffect(() => {
        loadQuery.mutateAsync(`${post.id}`).then((response) => {
            let content = null;
            try {
                content = JSON.parse(response.data.content);
            } catch (e) {
                Log.error(e);
            }
            if (content !== null) {
                setInitialContent(content);
            }
        });
    }, [])
    return (
        <>
            <Flex
                mb={8}
            >
                <Skeleton asChild loading={laoding}>
                    <Heading size="sm">
                        {post.title}
                    </Heading>
                </Skeleton>
                <Button
                    ml="auto"
                    size="xs"
                    variant="solid"
                    onClick={handleSave}
                    disabled={saveMuatation.isPending}
                >
                    Save
                </Button>
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