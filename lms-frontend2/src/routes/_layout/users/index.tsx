import { UserDocument } from "@/client/types.gen";
import PermissionsNiceDialog from "@/components/Accounts/PermissionsNiceDialog";
import { DataTable } from "@/components/DataTable/DataTable";
import NiceModal from "@/components/NiceModal/NiceModal";
import { Button } from "@/components/ui/button";
import { useResourceTable } from "@/hooks/useResource";
import { getActionsColumn } from "@/utils/table/getActionsColumn";
import {
  Badge,
  Container,
  Flex,
  Heading,
  Menu,
  Portal
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

const col = createColumnHelper<any>();

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
          col.accessor("user_type", {
            header: "Payment",
            enableSorting: false,
            cell: ({ getValue }) => {
              const colorScheme = {
                free: "blue",
                paid: "green",
                premium_paid: "purple",
              }
              const value = getValue();
              return (
                <Badge
                  colorPalette={colorScheme[value as keyof typeof colorScheme]}
                  variant="solid"
                  fontSize="xs"
                  textTransform="capitalize"
                >
                  {value}
                </Badge>
              )
            },
            meta: {
              filter: {
                key: "user_type",
                variant: "select",
                selectOptions: [
                  { label: "Бесплатный", value: "free" },
                  { label: "Оплаченный", value: "paid" },
                  { label: "Премиум оплаченный", value: "premium_paid" }
                ],
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
            ],
            options: {
              defaultActions: {
              }
            }
          }),
        ];
        return cols;
      }, [])
    const tableData = useResourceTable<any>({
      endpoint: url,
      routeId: Route.id,
      makeColumns: makeColumns,
    });
    const [rowSelection, setRowSelection] = useState({})
    const actionRowSelection = useMemo(() => {
      return {
        length: Object.keys(rowSelection).length,
      }
    }, [rowSelection])
    return (
      <Container maxW="full" py={12}>
        <Flex
          mb={8}
        >
          <Heading size="lg">
            Users Management
          </Heading>
          <Menu.Root size={"sm"} onSelect={console.log}>
            <Menu.Trigger asChild>
              <Button variant="solid" size="xs" ml={"auto"}>
                Actions
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="switch-payment" disabled={actionRowSelection.length === 0}>
                    Swicth payment
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>

        <DataTable
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
          }}
          reactTableProps={{
            state: {
              rowSelection,
            },
            enableRowSelection: true,
            onRowSelectionChange: setRowSelection,
          }}
        />
      </Container>
    )
  }
});
