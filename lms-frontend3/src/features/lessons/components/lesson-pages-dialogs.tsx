import type { DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import { DataTableActionsMenu } from "@/components/datatable/data-table-actions-menu";
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
import { DndDatatable } from "@/features/lesson-pages/component/DndDatatable";
import type { LessonPageDocument } from "@/features/lesson-pages/data/schema";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useResource } from "@/hooks/use-resource";
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { EditIcon, SaveIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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
  const columns = useMemo(() => {
    return [
      col.display({
        id: "dragHandle",
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
                openPages: {
                  label: "Open Editor",
                  shortcutIcon: <EditIcon />,
                  callback: ({ row }) => {
                    openPostEditorMutation.mutate(row.original.id, {
                      onSuccess(data: any) {
                        const postObj = data.post;
                        const url = `/resources/posts/${postObj.id}/edit-content?type=editor2&lesson_page_id=${row.original.id}`;
                        window.open(url, "_blank");
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
                              resource.query.refetch();
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
  }, []);
  const resource = useResource<LessonPageDocument>({
    name: "lessons",
    url: `/lessons/pages`,
    columns,
    transformToApiParams(data: any) {
      const newData = {
        ...data,
        lesson_id: lessonId,
        page: 1,
        page_size: 100,
        ordering: "-order",
      };
      return newData;
    },
  });
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
      resource.query.refetch();
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
      resource.query.refetch();
      setDataChangeState(false);
    },
  });
  const [dataList, setDataList] = useState<LessonPageDocument[]>([]);
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
              <DndDatatable
                resource={resource}
                onReorder={(data) => {
                  setDataList(data);
                  setDataChangeState(true);
                }}
              />
            </ScrollArea>
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
