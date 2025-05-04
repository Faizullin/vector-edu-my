import { DataTable } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { useResourceTable } from "@/hooks/useResource";
import {
  Container,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnHelper, createColumnHelper, Row } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPenTool, FiTrash } from "react-icons/fi";

/* ---------- data type ---------- */
type Lesson = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};


const col = createColumnHelper<Lesson>();


interface ActionColumn<T> {
  render: ({
    row,
    key,
  }: {
    row: Row<T>;
    key?: any;
  }) => React.ReactNode;
  displayType: "extra" | "default";
}
function getActionsColumn<T>(col: ColumnHelper<T>, conf: {
  actions?: Array<ActionColumn<T>>;
  options?: {
    disableDefaultActions?: boolean;
    defaultActions?: {
      edit?: (row: Row<T>) => void;
      delete?: (row: Row<T>) => void;
    },
  } | undefined;
} | undefined = undefined) {
  const { actions, options } = conf || {};
  const defaultActions: ActionColumn<T>[] = [
    {
      render: ({ row, key }) => (
        <IconButton key={key} size="xs" aria-label="actions edit" variant="ghost" onClick={() => options?.defaultActions?.edit?.(row)} color={"blue.500"}>
          <FiPenTool />
        </IconButton>
      ),
      displayType: "default",
    },
    {
      render: ({ row, key, }) => (
        <IconButton key={key} size="xs" aria-label="actions destroy" variant="ghost" onClick={() => options?.defaultActions?.delete?.(row)} color={"red.500"}>
          <FiTrash />
        </IconButton>
      ),
      displayType: "default",
    },
  ];
  const actionsList = (options?.disableDefaultActions ? (actions || []) : [...(actions || []), ...defaultActions]).filter((action) => {
    return action.displayType === "default";
  });
  const extraActionsList = (actions || []).filter((action) => {
    return action.displayType === "extra";
  });
  return col.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <>
          {
            actionsList.map((action, index) => {
              const { render } = action;
              return render({
                row: row,
                key: `actions-${row.id}-${index}`,
              });
            })
          }
          {
            extraActionsList.length > 0 && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton variant="outline" size={"sm"}>
                    <BsThreeDotsVertical />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {
                        extraActionsList.map((action, index) => {
                          const { render } = action;
                          const el = render({
                            row: row,
                          });
                          return (
                            <Menu.Item key={`actions-${row.id}-${index}`} value="action-${index}" asChild>
                              {el}
                            </Menu.Item>
                          );
                        })
                      }
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )
          }
        </>
      );
    },
  });
}

export const Route = createFileRoute("/_layout/lessons/")({
  component: () => {
    const url = useMemo(() => {
      return `/lessons/lessons/`;
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
          col.accessor("title", {
            header: "Lessonname",
            enableSorting: false,
            meta: {
              filter: {
                key: "title",
                variant: "text",
              }
            }
          }),
          col.accessor("created_at", {
            header: "Created At",
            cell: ({ getValue }) => {
              const date = new Date(getValue() as string);
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
            },
          }),
          getActionsColumn<Lesson>(col, {
            actions: [
              {
                render: ({ row, key }) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <Link to={`/lessons/$lessonId/pages`} params={{ lessonId: `${row.original.id}` }}>
                      Pages
                    </Link>
                  </Button>
                ),
                displayType: "extra",
              },
            ],
            options: {
              disableDefaultActions: true,
            },
          }),
        ];
        return cols;
      }, [])
    const tableData = useResourceTable<Lesson>({
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
            Lessons Management
          </Heading>
          <Button
            ml="auto"
            size="sm"
            variant="solid"
          // onClick={handleAddPage}
          // disabled={addPageMutation.isPending}
          >
            Add
          </Button>
        </Flex>

        <DataTable<Lesson>
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
