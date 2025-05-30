"use client";

import { DatatablePagePanel } from "@/components/datatable";
import { DataTableRowActions } from "@/components/datatable/data-table-row-actions";
import LongText from "@/components/datatable/long-text";
import { DeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import NiceModal from "@/context/nice-modal-context";
import { useResource } from "@/hooks/use-resource";
import { cn } from "@/lib/utils";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { PostEditNiceDialog } from "./components/posts-dialogs";
import {
  postsPublicationStatusOptions,
  type PostDocument,
} from "./data/schema";

const col = createColumnHelper<PostDocument>();

const publicationStatusTypes = new Map<
  PostDocument["publication_status"],
  string
>([
  [1, "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
  [0, "bg-neutral-300/40 border-neutral-300"],
]);

export default function Posts() {
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      fetch(`/resources/posts/${id}/`, {
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
      col.accessor("post_type", {
        header: "Post type",
        enableSorting: false,
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
          sizeBorderStyle: true,
        },
        enableHiding: true,
      }),
      col.accessor("publication_status", {
        header: "Publication",
        enableSorting: false,
        cell: ({ row }) => {
          const { publication_status } = row.original;
          const badgeColor = publicationStatusTypes.get(publication_status);
          return (
            <div className="flex space-x-2">
              <Badge variant="outline" className={cn("capitalize", badgeColor)}>
                {
                  postsPublicationStatusOptions.find(
                    (option) => option.value === `${publication_status}`
                  )?.label
                }
              </Badge>
            </div>
          );
        },
        meta: {
          filter: {
            type: "select",
            options: postsPublicationStatusOptions,
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
              defaultActions={{
                edit: {
                  callback: ({ row }) => {
                    NiceModal.show(PostEditNiceDialog, {
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
                          showToast("error", {
                            message: "Post deleted successfully",
                            data: {
                              duration: 2000,
                            },
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
  const resource = useResource<PostDocument>({
    name: "posts",
    url: `/resources/posts`,
    columns,
  });
  const handleCreate = useCallback(() => {
    NiceModal.show(PostEditNiceDialog, {});
  }, []);
  return (
    <Main>
      <DatatablePagePanel
        resource={resource}
        topbar={{
          title: "Post List",
          subtitle: "Manage your posts.",
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
  );
}
