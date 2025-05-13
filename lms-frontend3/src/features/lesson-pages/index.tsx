import type { DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import { DataTableActionsMenu } from "@/components/datatable/data-table-actions-menu";
import { DataTableRowActions } from "@/components/datatable/data-table-row-actions";
import { DeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import NiceModal from "@/components/nice-modal/NiceModal";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useResource } from "@/hooks/use-resource";
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { EditIcon, SaveIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DndDatatable } from "./component/DndDatatable";
import type { LessonPageDocument } from "./data/schema";

const col = createColumnHelper<LessonPageDocument>();

export default function LessonPages() {
  const urlParams = useParams({
    from: "/_layout/lessons/$lesson_id/pages",
  });
  const { lesson_id } = urlParams;
  const navigate = useNavigate();
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
                            title: "Lesson deleted successfully",
                            duration: 2000,
                          });
                          deleteMutation
                            .mutateAsync(row.original.id)
                            .then(() => {
                              resource.query.refetch();
                            });
                        }
                      },
                    );
                  },
                },
              }}
            />
          );
        },
      }),
    ];
  }, [navigate]);
  const resource = useResource<LessonPageDocument>({
    name: "lessons",
    url: `/lessons/pages`,
    columns,
    transformToApiParams(data: any) {
      const newData = {
        ...data,
        lesson_id,
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
    addPageMutation.mutate(lesson_id as DocumentId);
  }, [addPageMutation]);
  const handleSaveOrder = useCallback(() => {
    if (!dataChangeState) return;
    saveOrderMutation.mutate({
      lessonId: lesson_id as DocumentId,
      dataIds: dataList.map((item) => item.id),
    });
  }, [saveOrderMutation, dataChangeState, dataList]);
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Lesson Page List
            </h2>
            <p className="text-muted-foreground">
              This is the list of lesson pages.
            </p>
          </div>
          <div className="flex gap-2">
            <DataTableActionsMenu actions={[]} />
            <Button
              className="space-x-1"
              size="sm"
              onClick={handleSaveOrder}
              disabled={!dataChangeState}
            >
              <span>Save</span> <SaveIcon size={18} />
            </Button>
            <Button
              className="space-x-1"
              onClick={handleCreate}
              disabled={addPageMutation.isPending}
              size={"sm"}
            >
              <span>Add</span> <IconPlus size={18} />
            </Button>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <DndDatatable
            resource={resource}
            onReorder={(data) => {
              setDataList(data);
              setDataChangeState(true);
            }}
          />
        </div>
      </Main>
    </>
  );
}
