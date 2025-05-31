"use client";

import Datatable, { ActionRegistry } from "@/components/datatable";
import LongText from "@/components/datatable/long-text";
import { showDeleteConfirmNiceDialog } from "@/components/dialogs/delete-confirm-nice-dialog";
import { Main } from "@/components/layout/main";
import { simpleRequest } from "@/lib/simpleRequest";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
  ReportViewContentNiceDialog,
  RequestReportNiceDialog,
} from "./components/reports-dialogs";
import { type ReportDocument } from "./data/schema";

const col = createColumnHelper<ReportDocument>();

const queryKey = "reports";

export default function Reports() {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/reports/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      showToast("success", {
        message: "Report deleted successfully",
      });
    },
  });
  const actions: ActionRegistry<ReportDocument> = useMemo(
    () => ({
      create: {
        label: "Request Report",
        callback: () => {
          showComponentNiceDialog(RequestReportNiceDialog).then(
            ({ result }) => {
              if (result) {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
              }
            }
          );
        },
        icon: <Plus className="mr-2 h-4 w-4" />,
        renderType: "panel",
      },
      view: {
        label: "View",
        callback: (item) => {
          showComponentNiceDialog(ReportViewContentNiceDialog, {
            recordId: item!.id,
          });
        },
        icon: <Eye className="h-4 w-4" />,
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
    }),
    [deleteMutation]
  );
  const topbar = {
    title: "Reports",
    subtitle: "Manage your reports",
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
      col.accessor("created_at", {
        header: "Created At",
        cell: ({ row }) => {
          return (
            <LongText className="max-w-36">
              {new Date(row.getValue("created_at")).toLocaleString()}
            </LongText>
          );
        },
      }),
      col.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Datatable.RowActions
            item={row.original}
            actionNames={["view", "delete"]}
          />
        ),
      }),
    ];
  }, []);
  return (
    <Main>
      <Datatable.Root<ReportDocument>
        resource={{
          name: "reports",
          url: `/reports`,
          columns,
        }}
        topbar={topbar}
        actions={actions}
      >
        <Datatable.Panel panelActions={["create"]}>
          <Datatable.Table />
        </Datatable.Panel>
      </Datatable.Root>
    </Main>
  );
}
