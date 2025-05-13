import { LessonDocument } from "@/client/types.gen";
import { DataTable } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { useResourceTable } from "@/hooks/useResource";
import { getActionsColumn } from "@/utils/table/getActionsColumn";
import {
  Container,
  Flex,
  Heading
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";


const col = createColumnHelper<LessonDocument>();

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
            header: "Title",
            enableSorting: false,
            meta: {
              filter: {
                key: "title",
                variant: "text",
              }
            }
          }),
          getActionsColumn<LessonDocument>({
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
              defaultActions: {
              }
            }
          }),
        ];
        return cols;
      }, [])
    const tableData = useResourceTable<LessonDocument>({
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

        <DataTable<LessonDocument>
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
        />
      </Container>
    )
  }
});
