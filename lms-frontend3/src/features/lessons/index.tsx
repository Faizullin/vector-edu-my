import type { DocumentId } from "@/client";
import { simpleRequest } from "@/client/core/simpleRequest";
import { DatatablePagePanel } from "@/components/datatable";
import { DataTableRowActions } from "@/components/datatable/data-table-row-actions";
import { DeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import LongText from "@/components/long-text";
import NiceModal from "@/components/nice-modal/NiceModal";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useResource } from "@/hooks/use-resource";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonPageDrawer } from "./components/lesson-pages-dialogs";
import { LessonEditNiceDialog } from "./components/lessons-dialogs";
import { type LessonBatchDocument, type LessonDocument } from "./data/schema";

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
  const urlParams = useSearch({
    from: "/_layout/lessons/lessons",
  });
  const batch_id = useMemo(() => {
    const { batch_id } = urlParams as any;
    return batch_id ? (batch_id as DocumentId) : null;
  }, [urlParams]);
  const navigate = useNavigate();
  const { showSuccessToast } = useCustomToast();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/lessons/lessons/${id}/`,
        method: "DELETE",
      }),
  });
  const lessonQuery = useQuery<LessonBatchDocument>({
    queryKey: ["lesson-batches", batch_id],
    queryFn: () =>
      simpleRequest({
        url: `/lessons/batches/${batch_id}`,
        method: "GET",
      }),
    enabled: !!batch_id,
  });
  const pagesDrawerControl = useDrawerControl();
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
        cell: ({ row }) => {
          return (
            <DataTableRowActions
              row={row}
              actions={{
                // openPages: {
                //   label: "Open Pages",
                //   shortcutIcon: <BookOpenIcon />,
                //   callback: ({ row }) => {
                //     navigate({
                //       to: `/lessons/${row.original.id}/pages`,
                //       params: { lesson_id: `${row.original.id}` },
                //     });
                //   },
                // },
                openPages: {
                  label: "Open Pages",
                  shortcutIcon: <BookOpenIcon />,
                  callback: ({ row }) => {
                    pagesDrawerControl.openDrawer(row.original.id);
                  },
                },
              }}
              defaultActions={{
                edit: {
                  callback: ({ row }) => {
                    NiceModal.show(LessonEditNiceDialog, {
                      recordId: row.original.id,
                      record: row.original,
                    });
                  },
                },
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
  }, [navigate]);
  const [ready, setReady] = useState(false);
  const resource = useResource<LessonDocument>({
    name: "lessons",
    url: `/lessons/lessons`,
    columns,
    enabled: ready,
    transformToApiParams(data: any) {
      const newData = {
        ...data,
      };
      if (data?.lesson_batch) {
        newData.batch_id = data.lesson_batch;
        delete newData.lesson_batch;
      }
      return newData;
    },
  });
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
  }, [batch_id]);
  const handleCreate = useCallback(() => {
    showComponentNiceDialog(LessonEditNiceDialog, {
      defaultValues: {
        lesson_batch: lessonQuery.data,
      },
    });
  }, [lessonQuery.data]);
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
        <LessonPageDrawer
          lessonId={pagesDrawerControl.recordId}
          open={pagesDrawerControl.open}
          onOpenChange={(v) => !v && pagesDrawerControl.closeDrawer()}
        />
        <DatatablePagePanel
          resource={resource}
          topbar={{
            title: "Lesson List",
            subtitle: "Manage your lessons.",
          }}
          actions={[
            {
              id: "add",
              label: "Add",
              renderType: "panel",
              callback: handleCreate,
              shortcutIcon: <PlusIcon />,
            },
          ]}
        />
      </Main>
    </>
  );
}
