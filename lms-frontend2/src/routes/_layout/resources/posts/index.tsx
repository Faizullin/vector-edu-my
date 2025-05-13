import { PostDocument } from "@/client/types.gen";
import { DataTable, } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { useResourceTable } from "@/hooks/useResource";
import { getActionsColumn } from "@/utils/table/getActionsColumn";
import {
  Link as ChakraLink,
  Container,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";


const col = createColumnHelper<PostDocument>();

export const Route = createFileRoute("/_layout/resources/posts/")({
  component: () => {
    const url = useMemo(() => {
      return `/resources/posts/`;
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
          col.accessor("author", {
            header: "Author",
            enableSorting: false,
            cell: ({ getValue }) => {
              const { id, username } = getValue() as PostDocument["author"];
              return (
                <ChakraLink
                  fontWeight="medium"
                  color="teal.600"
                  _hover={{ textDecor: "underline" }}
                  asChild
                >
                  <Link
                    to={`/users`}
                    search={{ id: id }}>
                    {username}
                  </Link>
                </ChakraLink>
              );
            },
            meta: {
              filter: {
                key: "author",
                variant: "select",
                selectSearchApi: {
                  url: "/accounts/users/",
                  parseResponse: (response: any) => {
                    return response.results.map((item: any) => ({
                      label: item.username,
                      value: item.id,
                    }));
                  },
                }
              }
            }
          }),
          col.accessor("publication_status", {
            header: "Publication",
            enableSorting: false,
            cell: ({ getValue }) => {
              const status = getValue() as PostDocument["publication_status"];
              return status === 1 ? "Published" : "Draft";
            },
            meta: {
              filter: {
                key: "publication_status",
                variant: "select",
                selectOptions: [
                  { label: "Published", value: "1" },
                  { label: "Draft", value: "0" },
                ],
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
          getActionsColumn<PostDocument>({
            options: {
              defaultActions: {
                edit: (row) => {
                  console.log("edit", row.original);
                },
                delete: (row) => {
                  console.log("delete", row.original);
                },
              },
            }
          }),
        ];
        return cols;
      }, []);
    const tableData = useResourceTable<PostDocument>({
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
            Posts Management
          </Heading>
          <Button
            ml="auto"
            size="xs"
            variant="solid"
          // onClick={handleAddPage}
          // disabled={addPageMutation.isPending}
          >
            Add
          </Button>
        </Flex>

        <DataTable<PostDocument>
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
