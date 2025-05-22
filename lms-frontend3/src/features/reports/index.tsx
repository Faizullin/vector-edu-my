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
import { createColumnHelper } from "@tanstack/react-table";
import { PlusIcon, ViewIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import {
  ReportViewContentNiceDialog,
  RequestReportNiceDialog,
} from "./components/reports-dialogs";
import { type ReportDocument } from "./data/schema";

const col = createColumnHelper<ReportDocument>();

export default function Reports() {
  const { showSuccessToast } = useCustomToast();
  const deleteMutation = useMutation({
    mutationFn: (id: DocumentId) =>
      simpleRequest({
        url: `/reports/${id}/`,
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
        cell: ({ row }) => {
          return (
            <DataTableRowActions
              row={row}
              actions={{
                view: {
                  callback: () => {
                    NiceModal.show(ReportViewContentNiceDialog, {
                      recordId: row.original.id,
                    });
                  },
                  shortcutIcon: <ViewIcon />,
                  label: "View",
                },
              }}
              defaultActions={{
                delete: {
                  callback: ({ row }) => {
                    NiceModal.show(DeleteConfirmNiceDialog, {}).then(
                      ({ result }: any) => {
                        if (result) {
                          showSuccessToast({
                            title: "Report deleted successfully",
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
  const resource = useResource<ReportDocument>({
    name: "reports",
    url: `/reports`,
    columns,
  });
  const handleCreate = useCallback(() => {
    NiceModal.show(RequestReportNiceDialog, {}).then((result) => {
      console.log(result);
      if (result) {
        resource.query.refetch();
      }
    });
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
            title: "Report List",
            subtitle: "Manage your reports.",
          }}
          actions={[
            {
              id: "add",
              label: "Request",
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
