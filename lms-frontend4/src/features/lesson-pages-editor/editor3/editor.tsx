"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { simpleRequest } from "@/lib/simpleRequest";
import type { DocumentId } from "@/types";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation } from "@tanstack/react-query";
import {
  AlignLeft,
  Database,
  Edit,
  Eye,
  GripVertical,
  Plus,
  PlusCircle,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { BlockMenu } from "./components/block-menu";
import { BlockSidebar } from "./components/block-sidebar";
import LessonDemoDataNiceDialog from "./components/LessonDemoDataNiceDialog";
import ViewDataNiceDialog from "./components/view-data-nice-dialog";
import { ActionsProvider, useActionsContext } from "./context/actions-context";
import { SortableBlockWrapper } from "./context/dnd-context";
import { EditorProvider, useEditor } from "./context/editor-context";
import {
  EditorLoadDataProps,
  LoadDataProvider,
  useLoadDataContext,
} from "./context/load-data-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "./context/sidebar-context";
import { useControlState } from "./hooks";
import { schema } from "./schema";
import type { Block, BlockIdentifier } from "./types";
import { createSaveData, getEditorLink } from "./utils";

const schemaArr = Object.values(schema);
const SuggestionList = memo(
  ({ addBlock }: { addBlock: (type: string) => void }) => {
    return (
      <>
        {schemaArr.map((blockSchema) => {
          if (!blockSchema.suggestionMenu) {
            return null;
          }
          return (
            <SuggestListItem
              key={blockSchema.type}
              blockSchema={blockSchema}
              addBlock={addBlock}
            />
          );
        })}
      </>
    );
  }
);

SuggestionList.displayName = "SuggestionList";

const SuggestListItem = ({
  blockSchema,
  addBlock,
}: {
  blockSchema: (typeof schemaArr)[number];
  addBlock: (type: string, afterId?: BlockIdentifier) => void;
}) => {
  const rendered = useMemo(
    () => blockSchema.suggestionMenu({ addBlock }),
    [blockSchema, addBlock]
  );
  return (
    <DropdownMenuItem
      key={blockSchema.type}
      className="flex items-center gap-2 p-2 border-b last:border-b-0"
      onClick={() => addBlock(blockSchema.type)}
    >
      {rendered.icon({})}
      <span>{rendered.title}</span>
    </DropdownMenuItem>
  );
};

const ErrorBoundaryComponetRender = ({ error }: { error: Error }) => {
  return (
    <div className="p-4 text-center border rounded-md bg-red-50">
      <h3 className="text-lg font-semibold text-red-800">Error</h3>
      <p className="text-sm text-red-600">{error.message}</p>
    </div>
  );
};

const RenderContent = (props: { block: Block }) => {
  const blockSchema = schema[props.block.type];

  if (!blockSchema) {
    const error = new Error(
      `Block type "${props.block.type}" is not registered in the schema or is currently developing.`
    );
    return <ErrorBoundaryComponetRender error={error} />;
  }
  const BlockComponent = blockSchema.render;
  return (
    <div className="block-content">
      <BlockComponent block={props.block} />
    </div>
  );
};

const RenderEditor = () => {
  const {
    blocks,
    setBlocks,
    removeBlock,
    moveBlock,
    selectedBlockIdControl,
    hoveredBlockIdControl,
    addBlock,
    changeState,
    publicationState,
  } = useEditor();
  const { loadRelatedLessonPagesMutation, loadAndParseEditor,
    makeTemplateFromBlock, } =
    useActionsContext();

  const { postObj, lessonObj, lessonPageObj } = useLoadDataContext();
  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockIdControl.state),
    [blocks, selectedBlockIdControl.state]
  );
  const addButtonShown = useMemo(() => blocks.length === 0, [blocks]);
  const activeBlockIdControl = useControlState<BlockIdentifier | null>(null);
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    activeBlockIdControl.setState(event.active.id as string);
  };
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        // Create a new array with the item moved to the new position
        const newBlocks = [...blocks];
        const [movedItem] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, movedItem);

        setBlocks(newBlocks);
      }

      activeBlockIdControl.setState(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocks]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { saveMuatation, publishMutation, loadDemoMutation } =
    useActionsContext();

  const handleSave = useCallback(() => {
    const content = JSON.stringify(createSaveData(blocks));
    saveMuatation.mutateAsync(content!).then((response) => {
      if (response.success === 1) {
        changeState.setState(false);
        publicationState.setState(response.data.instance.publication_status === 1 ? "published" : "draft");
      }
    });
  }, [saveMuatation, blocks]);
  const handlePublish = useCallback(() => {
    const newPublicationStatus = publicationState.state === "published" ? "draft" : "published";
    publishMutation.mutateAsync({
      content: JSON.stringify(createSaveData(blocks)),
      publication_status: newPublicationStatus,
    }).then((response) => {
      if (response.success === 1) {
        changeState.setState(false);
        publicationState.setState(response.data.instance.publication_status === 1 ? "published" : "draft");
      }
    });
  }, [publishMutation, blocks, publicationState.state]);
  const handleLoadDemoData = useCallback(() => {
    loadDemoMutation.mutateAsync(postObj.id).then((response: any) => {
      showComponentNiceDialog(LessonDemoDataNiceDialog, {
        lesson_page_data: response.data.lesson_page,
      });
    });
  }, [postObj.id, loadDemoMutation]);

  const handleViewData = useCallback(() => {
    showComponentNiceDialog(ViewDataNiceDialog, {
      content: blocks,
    });
  }, [blocks]);

  const openPostEditorMutation = useMutation({
    mutationFn: (pageId: DocumentId) => {
      return simpleRequest({
        url: `/lessons/pages/${pageId}/get-editor`,
        method: "POST",
      });
    },
  });

  const handleLoadAnotherPage = useCallback(
    (pageId: DocumentId) => {
      openPostEditorMutation.mutate(pageId, {
        onSuccess(data: any) {
          const postObj = data.post;
          window.location.href = getEditorLink(
            lessonObj.id,
            pageId,
            postObj.id
          );
        },
      });
    },
    [lessonObj.id, openPostEditorMutation]
  );

  useEffect(() => {
    loadRelatedLessonPagesMutation.mutateAsync()
      .then(() => {
        loadAndParseEditor().then(({ response }) => {
          if (response.success === 1) {
            publicationState.setState(
              response.data.instance.publication_status === 1
                ? "published"
                : "draft"
            );
          }
        });
      });
  }, []);

  const saveDisabled = useMemo(() => {
    return !blocks.length || saveMuatation.isPending || !changeState.state;
  }, [
    blocks.length,
    saveMuatation.isPending,
    changeState.state,
  ]);
  const publishDisabled = useMemo(() => {
    return !blocks.length || publishMutation.isPending || !changeState.state;
  }, [
    blocks.length,
    publishMutation.isPending,
    changeState.state,
  ]);

  return (
    <>
      <div className="relative border rounded-lg shadow-sm flex-grow bg-white dark:bg-gray-800">
        {/* Editor toolbar */}
        <div className="border-b p-2 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Block Editor</h2>
              <Select
                value={`${lessonPageObj.id}`}
                onValueChange={(value) => {
                  handleLoadAnotherPage(Number(value));
                }}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {loadRelatedLessonPagesMutation.data?.map((page) => (
                    <SelectItem key={page.id} value={`${page.id}`}>
                      {page.title ? `${page.title} [#${page.id}]` : `Page ${page.order} [#${page.id}]`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={saveDisabled}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={publishDisabled}
                className="flex items-center gap-1"
                variant={publicationState.state === "published" ? "secondary" : "default"}
              >
                {publicationState.state === "published" ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish</span>
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <span className="hidden sm:inline">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLoadDemoData}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Demo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleViewData}>
                    <Database className="mr-2 h-4 w-4" />
                    <span>View Current Data</span>
                  </DropdownMenuItem>
                  {
                    publicationState.state === "published" ? (
                      <DropdownMenuItem
                        onClick={handlePublish}
                      >
                        <AlignLeft className="mr-2 h-4 w-4" />
                        <span>Unpublish</span>
                      </DropdownMenuItem>
                    ) : null
                  }
                  {/*
                  <DropdownMenuItem onClick={exportBlocks}>
                    <Save className="mr-2 h-4 w-4" />
                    <span>Export JSON</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Blocks */}
        <ScrollArea className="w-full h-[calc(100vh-60px)]">
          <div className="max-w-[600px] mx-auto p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
                  <SortableBlockWrapper
                    key={block.id}
                    id={block.id}
                    isDragging={activeBlockIdControl.state === block.id}
                    isSelected={selectedBlockIdControl.state === block.id}
                    isHovered={hoveredBlockIdControl.state === block.id}
                    onSelect={() => selectedBlockIdControl.setState(block.id)}
                    onHover={(hovered) => {
                      if (hovered) {
                        hoveredBlockIdControl.setState(block.id);
                      } else if (hoveredBlockIdControl.state === block.id) {
                        hoveredBlockIdControl.setState(null);
                      }
                    }}
                    dragHandle={
                      <div className="drag-handle flex items-center justify-center h-6 w-6 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                    }
                  >
                    <div
                      key={block.id}
                      // ref={(el) => (blockRefs.current[block.id] = el)}
                      className={`block-container relative p-2  border-b last:border-b-0 transition-colors ${selectedBlockIdControl.state === block.id
                        ? "bg-blue-50"
                        : hoveredBlockIdControl.state === block.id
                          ? "bg-gray-50"
                          : "bg-white"
                        }`}
                    >
                      <div
                      // onClick={() => selectedBlockIdControl.setState(block.id)}
                      // onMouseEnter={() =>
                      //   hoveredBlockIdControl.setState(block.id)
                      // }
                      // onMouseLeave={() => hoveredBlockIdControl.setState(null)}
                      >
                        {/* Block menu on the left */}
                        <div
                          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full transition-opacity ${selectedBlockIdControl.state === block.id ||
                            hoveredBlockIdControl.state === block.id
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                        >
                          <BlockMenu
                            blockId={block.id!}
                            onMoveUp={() => moveBlock(block.id, "up")}
                            onMoveDown={() => moveBlock(block.id, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < blocks.length - 1}
                          />
                        </div>

                        {/* Edit and Delete buttons on the top right */}
                        <div
                          className={`absolute top-2 right-2 flex gap-1 transition-opacity ${hoveredBlockIdControl.state === block.id
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full border shadow-sm bg-white dark:bg-gray-900 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              makeTemplateFromBlock(block.id);
                            }}
                            // disabled={block.data.static}
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span className="sr-only">Make template</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full border shadow-sm text-red-500 bg-white dark:bg-gray-900 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(block.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                        {/* Block content */}
                        <RenderContent block={block} />
                      </div>

                      {/* Add block button (shows when block is selected) */}
                      {block.type !== "placeholder" && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-gray-200 shadow-sm cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              <SuggestionList
                                addBlock={(type) => {
                                  addBlock(type, block.id);
                                }}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </SortableBlockWrapper>
                ))}
                {/* Add block button */}
                {addButtonShown && (
                  <div className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Block
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <SuggestionList addBlock={addBlock} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>
        </ScrollArea>
      </div>
      <Sidebar side="right">
        <SidebarHeader>
          <h3 className="text-lg font-medium">
            {selectedBlock ? "Block Settings" : "Block Editor"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedBlock
              ? `Edit the properties of the selected ${selectedBlock.type} block`
              : "Select a block to edit its properties"}
          </p>
        </SidebarHeader>
        <SidebarContent>
          {selectedBlock && selectedBlock.type !== "placeholder" ? (
            <>
              <BlockSidebar block={selectedBlock} />
            </>
          ) : (
            <div className="p-4 text-center border rounded-md bg-muted/20">
              <AlignLeft className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Select a block to edit its properties
              </p>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
    </>
  );
};
export const Editor = (props: EditorLoadDataProps) => {
  return (
    <LoadDataProvider {...props}>
      <EditorProvider>
        <ActionsProvider>
          <SidebarProvider>
            <RenderEditor />
          </SidebarProvider>
        </ActionsProvider>
      </EditorProvider>
    </LoadDataProvider>
  );
};
