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
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonEditNiceDialog } from "./components/lessons-dialogs";
import { type LessonDocument } from "./data/schema";

const col = createColumnHelper<LessonDocument>();

export default function Lessons() {
  const urlParams = useSearch({
    from: "/_layout/lessons/lessons",
  });
  const navigate = useNavigate();
  const { showSuccessToast } = useCustomToast();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/lessons/lessons/${id}/`,
        method: "DELETE",
      }),
  });
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
          },
        },
      }),
      col.display({
        id: "actions",
        cell: ({ row }) => {
          return (
            <DataTableRowActions
              row={row}
              actions={{
                openPages: {
                  label: "Open Pages",
                  shortcutIcon: <BookOpenIcon />,
                  callback: ({ row }) => {
                    navigate({
                      to: `/lessons/${row.original.id}/pages`,
                      params: { lesson_id: `${row.original.id}` },
                    });
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
    const { batch_id } = urlParams as any;
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
  }, [urlParams]);
  const handleCreate = useCallback(() => {
    NiceModal.show(LessonEditNiceDialog, {});
  }, []);
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
