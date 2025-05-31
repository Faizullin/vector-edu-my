"use client";

import Datatable, {
  ActionRegistry,
  useDatatable,
} from "@/components/datatable";
import LongText from "@/components/datatable/long-text";
import { showDeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Main } from "@/components/layout/main";
import { simpleRequest } from "@/lib/simpleRequest";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonPageDrawer } from "./components/lesson-pages-dialogs";
import { LessonEditNiceDialog } from "./components/lessons-dialogs";
import { LessonBatchDocument, LessonDocument } from "./data/schema";

const col = createColumnHelper<LessonDocument>();

const useDrawerControl = () => {
  const [open, setOpen] = useState(false);
  const [recordId, setRecordId] = useState<DocumentId | null>(null);
  const openDrawer = useCallback((recordId: DocumentId) => {
    setRecordId(recordId);
    setOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);
  return {
    open,
    openDrawer,
    closeDrawer,
    setRecordId,
    recordId,
  };
};
export default function Lessons() {
  const searchParams = useSearchParams();
  const batch_id = useMemo(() => {
    return searchParams.get("batch_id") || null;
  }, [searchParams]);
  const queryClient = useQueryClient();
  const lessonBatchQuery = useQuery({
    queryKey: ["lesson-batches", batch_id],
    queryFn: () =>
      simpleRequest<LessonBatchDocument>({
        url: `/lessons/batches/${batch_id}`,
        method: "GET",
      }),
    enabled: !!batch_id,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/lessons/lessons/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      showToast("success", {
        message: "Lesson deleted successfully",
      });
    },
  });
  const pagesDrawerControl = useDrawerControl();
  const actions: ActionRegistry<LessonDocument> = useMemo(
    () => ({
      create: {
        label: "Add",
        callback: () => {
          showComponentNiceDialog(LessonEditNiceDialog, {
            defaultValues: {
              lesson_batch: lessonBatchQuery.data,
            },
          });
        },
        icon: <Plus className="mr-2 h-4 w-4" />,
        renderType: "panel",
      },
      edit: {
        label: "Edit",
        callback: (item) => {
          showComponentNiceDialog(LessonEditNiceDialog, {
            recordId: item!.id,
          });
        },
        icon: <Pencil className="h-4 w-4" />,
        renderType: "row",
      },
      delete: {
        label: "Delete",
        callback: (item) => {
          showDeleteConfirmNiceDialog().then(({ result }) => {
            if (result) {
              deleteMutation.mutateAsync(item!.id);
            }
          });
        },
        icon: <Trash2 className="h-4 w-4" />,
        renderType: "row",
        loading: deleteMutation.isPending,
      },
      openPages: {
        label: "Open Pages",
        callback: (item) => {
          pagesDrawerControl.openDrawer(item!.id);
        },
        icon: <Eye className="h-4 w-4" />,
        renderType: "row",
      },
    }),
    [deleteMutation, lessonBatchQuery.data, pagesDrawerControl.openDrawer]
  );
  const topbar = {
    title: "Lessons",
    subtitle: "Manage your course lessons and content",
  };
  const columns = useMemo(() => {
    return [
      col.accessor("id", {
        header: "ID",
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
        },
        enableHiding: false,
      }),
      col.accessor("title", {
        header: "Title",
        enableSorting: false,
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
          sizeBorderStyle: true,
        },
        cell: ({ row }) => (
          <LongText className="max-w-36">{row.getValue("title")}</LongText>
        ),
        enableHiding: false,
      }),
      col.accessor("lesson_batch", {
        header: "Lesson Batch",
        enableSorting: false,
        cell: ({ row }) => (
          <LongText className="max-w-36">
            {row.original.lesson_batch?.title}
          </LongText>
        ),
        meta: {
          filter: {
            type: "select",
            options: [],
            displayType: "toolbar",
            query: {
              key: ["lesson-batches"],
              fetchOptionsUrl: `/lessons/batches`,
              transformResponse: (data: LessonBatchDocument[]) => {
                return data.map((item) => ({
                  label: item.title,
                  value: `${item.id}`,
                }));
              },
            },
          },
        },
      }),
      col.accessor("is_available_on_free", {
        header: "Is Available on Free",
        enableSorting: false,
        cell: ({ row }) => {
          return row.getValue("is_available_on_free") ? "Yes" : "No";
        },
        meta: {
          filter: {
            type: "select",
            options: [
              {
                label: "Yes",
                value: "true",
              },
              {
                label: "No",
                value: "false",
              },
            ],
            displayType: "toolbar",
          },
        },
      }),
      col.accessor("order", {
        header: "Order",
        enableSorting: true,
        cell: ({ row }) => {
          return row.getValue("order") ? row.getValue("order") : "-";
        },
      }),
      col.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Datatable.RowActions
            item={row.original}
            actionNames={["edit", "delete", "openPages"]}
          />
        ),
      }),
    ];
  }, []);
  const [ready, setReady] = useState(false);
  return (
    <Main>
        <LessonPageDrawer
          lessonId={pagesDrawerControl.recordId}
          open={pagesDrawerControl.open}
          onOpenChange={(v) => !v && pagesDrawerControl.closeDrawer()}
        />
      <Datatable.Root
        resource={{
          name: "lessons",
          url: "/lessons/lessons",
          columns,
          enabled: ready,
          transformToApiParams: (params) => {
            const newData: any = {
              ...params,
            };
            if (newData.lesson_batch) {
              newData["batch_id"] = `${newData.lesson_batch}`;
              delete newData.lesson_batch;
            }
            return newData;
          },
        }}
        actions={actions}
        topbar={topbar}
      >
        <Datatable.Panel panelActions={["create"]}>
          <Datatable.Table />
          <InitialFilterSetter batch_id={batch_id} setReady={setReady} />
        </Datatable.Panel>
      </Datatable.Root>
    </Main>
  );
}

const InitialFilterSetter = ({
  setReady,
  batch_id,
}: {
  setReady: (ready: boolean) => void;
  batch_id: string | null;
}) => {
  const { resource } = useDatatable();
  useEffect(() => {
    if (batch_id) {
      resource.datatable.table.setColumnFilters((old) => {
        return [
          ...old,
          {
            id: "lesson_batch",
            value: `${batch_id}`,
          },
        ];
      });
      setReady(true);
    } else {
      setReady(true);
    }
  }, [batch_id, setReady, resource.datatable.table]);

  return null;
};
