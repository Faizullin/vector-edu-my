import { UserDocument } from "@/client/types.gen";
import PermissionsNiceDialog from "@/components/Accounts/PermissionsNiceDialog";
import { DataTable } from "@/components/DataTable/DataTable";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Button } from "@/components/ui/button";
import { useResourceTable } from "@/hooks/useResource";
import { getActionsColumn } from "@/utils/table/getActionsColumn";
import {
  Container,
  Flex,
  Heading
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

const col = createColumnHelper<UserDocument>();

export const Route = createFileRoute("/_layout/users/")({
  component: () => {
    const url = useMemo(() => {
      return `/accounts/users/`;
    }, []);
    const makeColumns = useCallback(
      () => {
        const cols = [
          col.accessor("id", {
            header: "ID",
            enableSorting: true,
            meta: {
              filter: {
                key: "id",
                variant: "text",
              }
            },
          }),
          col.accessor("username", {
            header: "Username",
            enableSorting: false,
            meta: {
              filter: {
                key: "username",
                variant: "text",
              }
            }
          }),
          col.accessor("email", {
            header: "Email",
            enableSorting: false,
            meta: {
              filter: {
                key: "email",
                variant: "text",
              }
            }
          }),
          col.accessor("first_name", {
            header: "First Name",
            enableSorting: false,
            meta: {
              filter: {
                key: "first_name",
                variant: "text",
              }
            }
          }),
          getActionsColumn<UserDocument>({
            actions: [
              {
                render: ({ row }) => {
                  return (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        NiceModal.show(PermissionsNiceDialog, {
                          user: row.original,
                          tab: "permissions",
                        });
                      }}
                    >
                      Permissions
                    </Button>
                  );
                },
                displayType: "extra",
              },
              {
                render: ({ row }) => {
                  return (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        console.log(row);
                      }}
                    >
                      Delete
                    </Button>
                  );
                },
                displayType: "extra",
              }
            ],
            options: {
              defaultActions: {
                edit: (row) => {
                  console.log(row);
                },
                delete: (row) => {
                  console.log(row);
                }
              }
            }
          }),
        ];
        return cols;
      }, [])
    const tableData = useResourceTable<UserDocument>({
      endpoint: url,
      routeId: Route.id,
      makeColumns: makeColumns,
    });
    return (
      <Container maxW="full" py={12}>
        <Flex
          mb={8}
        >
          <Heading size="lg">
            Users Management
          </Heading>
          {/* <Button
            ml="auto"
            size="sm"
            variant="solid"
          // onClick={handleAddPage}
          // disabled={addPageMutation.isPending}
          >
            Add
          </Button> */}
        </Flex>

        <DataTable<UserDocument>
          data={tableData.data}
          loading={tableData.loading}
          columns={tableData.columns}
          pagination={tableData.filters.pagination}
          paginationOptions={{
            onPaginationChange: (pagination) => {
              const paginationDict = typeof pagination === "function" ? pagination({
                pageIndex: tableData.filters.pagination.page,
                pageSize: tableData.filters.pagination.size,
              }) : pagination;
              tableData.setFilters((prev) => ({
                ...prev,
                pagination: {
                  page: paginationDict.pageIndex,
                  size: paginationDict.pageSize,
                },
              }))
            },
            rowCount: tableData.rowCount,
          }}
          filters={tableData.filters.filters}
          onFilterChange={(filters) => {
            tableData.setFilters((prev) => ({
              ...prev,
              filters: {
                ...prev.filters,
                ...filters,
              }
            }))
          }}
          sorting={tableData.filters.sortBy}
          onSortingChange={(updaterOrValue) => {
            tableData.setFilters((prev) => ({
              ...prev,
              sortBy: typeof updaterOrValue === "function"
                ? updaterOrValue(prev.sortBy)
                : updaterOrValue,
            }))
          }} />
      </Container>
    )
  }
});
