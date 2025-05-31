"use client";

import Datatable, { ActionRegistry } from "@/components/datatable";
import LongText from "@/components/datatable/long-text";
import { showDeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { simpleRequest } from "@/lib/simpleRequest";
import { cn } from "@/lib/utils";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
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

const queryKey = "posts";

export default function Posts() {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/resources/posts/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      showToast("success", {
        message: "Post deleted successfully",
      });
    },
  });
  const actions: ActionRegistry<PostDocument> = useMemo(
    () => ({
      create: {
        label: "Add",
        callback: () => {
          showComponentNiceDialog(PostEditNiceDialog);
        },
        icon: <Plus className="mr-2 h-4 w-4" />,
        renderType: "panel",
      },
      // export: {
      //   label: "Export",
      //   callback: (_, selectedItems) => {
      //     showToast("success", {
      //       message: `Exporting ${selectedItems?.length || 0} items`,
      //     });
      //   },
      //   icon: <FileDown className="mr-2 h-4 w-4" />,
      //   renderType: "panel",
      //   variant: "outline",
      // },
      edit: {
        label: "Edit",
        callback: (item) => {
          showComponentNiceDialog(PostEditNiceDialog, {
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
      // bulkDelete: {
      //   label: "Bulk Delete",
      //   callback: (_, selectedItems) => {
      //     if (
      //       selectedItems?.length &&
      //       window.confirm(`Delete ${selectedItems.length} items?`)
      //     ) {
      //       selectedItems.forEach((item) => deleteMutation.mutate(item.id));
      //     }
      //   },
      //   renderType: "menu",
      //   variant: "destructive",
      // },
    }),
    [deleteMutation]
  );
  const topbar = {
    title: "Posts",
    subtitle: "Manage your posts",
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
        header: "Actions",
        cell: ({ row }) => (
          <Datatable.RowActions
            item={row.original}
            actionNames={["edit", "delete"]}
          />
        ),
      }),
    ];
  }, []);
  return (
    <Main>
      <Datatable.Root<PostDocument>
        resource={{
          name: "posts",
          url: `/resources/posts`,
          columns,
        }}
        actions={actions}
        topbar={topbar}
      >
        <Datatable.Panel panelActions={["create"]}>
          <Datatable.Table />
        </Datatable.Panel>
      </Datatable.Root>
    </Main>
  );
}
