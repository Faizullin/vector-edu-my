import type { DocumentBase, DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import { DataTableActionsMenu } from "@/components/datatable/data-table-actions-menu";
import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { DataTableRowActions } from "@/components/datatable/data-table-row-actions";
import { DeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import NiceModal from "@/components/nice-modal/NiceModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEditorLink } from "@/features/lesson-pages-editor/editor2/utils";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  EditIcon,
  GripVertical,
  SaveIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import type { LessonPageDocument } from "../data/schema";

const col = createColumnHelper<LessonPageDocument>();

interface LessonPageDrawerProps {
  lessonId: DocumentId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonPageDrawer({
  open,
  onOpenChange,
  lessonId,
}: LessonPageDrawerProps) {
  const { showSuccessToast } = useCustomToast();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/lessons/pages/${id}/`,
        method: "DELETE",
      }),
  });
  const openPostEditorMutation = useMutation({
    mutationFn: (id: DocumentId) => {
      return simpleRequest({
        url: `/lessons/pages/${id}/get-editor/`,
        method: "POST",
      });
    },
  });
  const [dataList, setDataList] = useState<LessonPageDocument[]>([]);
  const query = useQuery<LessonPageDocument[]>({
    queryKey: ["lesson-pages", lessonId],
    queryFn: () => {
      return simpleRequest({
        url: `/lessons/pages`,
        method: "GET",
        query: {
          lesson_id: lessonId,
          ordering: "-order",
          disablePagination: true,
        },
      });
    },
    enabled: !!lessonId,
  });
  useEffect(() => {
    setDataList(query.data || []);
  }, [query.data]);
  const addPageMutation = useMutation({
    mutationFn: (lessonId: DocumentId) => {
      return simpleRequest({
        url: `/lessons/pages/`,
        method: "POST",
        formData: {
          lesson: `${lessonId}`,
        },
      });
    },
    onSuccess: () => {
      query.refetch();
    },
  });
  const [dataChangeState, setDataChangeState] = useState(false);
  const saveOrderMutation = useMutation({
    mutationFn: ({
      lessonId,
      dataIds,
    }: {
      lessonId: DocumentId;
      dataIds: DocumentId[];
    }) => {
      return simpleRequest({
        url: `/lessons/pages/reorder/`,
        method: "POST",
        formData: {
          lesson_id: `${lessonId}`,
          ordered_ids: dataIds.reverse(),
        },
      });
    },
    onSuccess: () => {
      query.refetch();
      setDataChangeState(false);
    },
  });
  const handleCreate = useCallback(() => {
    addPageMutation.mutate(lessonId!);
  }, [addPageMutation, lessonId]);
  const handleSaveOrder = useCallback(() => {
    if (!dataChangeState) return;
    saveOrderMutation.mutate({
      lessonId: lessonId!,
      dataIds: dataList.map((item) => item.id),
    });
  }, [saveOrderMutation, dataChangeState, dataList, lessonId]);
  const moveDown = useCallback(
    (id: DocumentId) => {
      const index = dataList.findIndex((item) => item.id === id);
      if (index < dataList.length - 1) {
        const newDataList = [...dataList];
        const temp = newDataList[index + 1];
        newDataList[index + 1] = newDataList[index];
        newDataList[index] = temp;
        setDataList(newDataList);
        setDataChangeState(true);
      }
    },
    [dataList]
  );
  const moveUp = useCallback(
    (id: DocumentId) => {
      const index = dataList.findIndex((item) => item.id === id);
      if (index > 0) {
        const newDataList = [...dataList];
        const temp = newDataList[index - 1];
        newDataList[index - 1] = newDataList[index];
        newDataList[index] = temp;
        setDataList(newDataList);
        setDataChangeState(true);
      }
    },
    [dataList]
  );
  const columns = useMemo(() => {
    return [
      col.display({
        id: "drag-handle",
        header: "Move",
        cell: ({ row }) => <DndRowDragHandleCell rowId={row.id} />,
        size: 40,
      }),
      col.accessor("id", {
        header: "ID",
        enableSorting: false,
      }),
      col.accessor("order", {
        header: "Order",
        enableSorting: false,
      }),
      col.display({
        id: "actions",
        cell: ({ row }) => {
          return (
            <DataTableRowActions
              row={row}
              actions={{
                moveUp: {
                  label: "Move Up",
                  shortcutIcon: <ChevronUp />,
                  callback: ({ row }) => {
                    moveUp(row.original.id);
                  },
                },
                moveDown: {
                  label: "Move Down",
                  shortcutIcon: <ChevronDown />,
                  callback: ({ row }) => {
                    moveDown(row.original.id);
                  },
                },
                openPages: {
                  label: "Open Editor",
                  shortcutIcon: <EditIcon />,
                  callback: ({ row }) => {
                    openPostEditorMutation.mutate(row.original.id, {
                      onSuccess(data: any) {
                        const postObj = data.post;
                        window.open(
                          getEditorLink(lessonId!, row.original.id, postObj.id),
                          "_blank"
                        );
                      },
                    });
                  },
                },
              }}
              defaultActions={{
                delete: {
                  callback: ({ row }) => {
                    NiceModal.show(DeleteConfirmNiceDialog, {}).then(
                      ({ result }: any) => {
                        if (result) {
                          showSuccessToast({
                            title: "Page deleted successfully",
                            duration: 2000,
                          });
                          deleteMutation
                            .mutateAsync(row.original.id)
                            .then(() => {
                              query.refetch();
                            });
                        }
                      }
                    );
                  },
                },
              }}
            />
          );
        },
      }),
    ];
  }, [lessonId]);
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dataList.map(({ id }) => `${id}`),
    [dataList]
  );
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const prevData = dataList;
        const oldIndex = prevData.findIndex(
          (item) => `${item.id}` === active.id
        );
        const newIndex = prevData.findIndex((item) => `${item.id}` === over.id);
        const updatedData = arrayMove([...prevData], oldIndex, newIndex);
        setDataList(updatedData);
        setDataChangeState(true);
      }
    },
    [dataList]
  );
  const table = useReactTable({
    data: dataList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => `${row.id}`,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={"bottom"}>
          <SheetHeader>
            <SheetTitle>Lesson Page List</SheetTitle>
            <SheetDescription>
              This is the list of lesson pages.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
            <div className="flex items-center space-x-2">
              <DataTableActionsMenu actions={[]} />
              <Button
                className="space-x-1"
                size="sm"
                onClick={handleSaveOrder}
                disabled={!dataChangeState}
              >
                <SaveIcon size={18} />
                <span>Save</span>
              </Button>
              <Button
                className="space-x-1"
                onClick={handleCreate}
                disabled={addPageMutation.isPending}
                size={"sm"}
              >
                <IconPlus size={18} /> <span>Add</span>
              </Button>
            </div>
            <ScrollArea className="p-4 mx-auto max-w-[600px] max-h-[70vh] overflow-auto">
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
              >
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          const classes = useMemo(() => {
                            return cn(
                              header.column.columnDef.meta?.sizeBorderStyle
                                ? cn(
                                    "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                                    "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                                    "sticky left-6 md:table-cell"
                                  )
                                : "",
                              header.column.columnDef.meta?.className || ""
                            );
                          }, [header.column.columnDef.meta]);
                          return (
                            <TableHead
                              key={header.id}
                              colSpan={header.colSpan}
                              className={classes}
                            >
                              {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                <DataTableColumnHeader
                                  column={header.column}
                                  title={String(header.column.columnDef.header)}
                                />
                              ) : (
                                flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {dataList.length > 0 ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <DraggableRow key={row.id} row={row} />
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </ScrollArea>
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DraggableRow<T extends DocumentBase>({ row }: { row: Row<T> }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${row.original.id}`,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group/row ${row.getIsSelected() ? "bg-muted/50" : ""}`}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => {
        const classes = cn(
          cell.column.columnDef.meta?.sizeBorderStyle
            ? cn(
                "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                "sticky left-6 md:table-cell"
              )
            : "",
          cell.column.columnDef.meta?.className || ""
        );
        return (
          <TableCell key={cell.id} className={classes}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

const DndRowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });
  return (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};
