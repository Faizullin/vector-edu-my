import { createListCollection, HStack, IconButton, Portal, Select } from "@chakra-ui/react"
import { Table } from "@tanstack/react-table"
import { useMemo } from "react"
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2"
import { useColorModeValue } from "../ui/color-mode"
import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "../ui/pagination"

interface Props<T> {
    pageSizeOptions?: number[]
    table: Table<T>
}
function DataTablePagination<T>({
    pageSizeOptions = [5, 10, 20, 30, 40, 50],
    table,
}: Props<T>) {
    const pageIdx = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const itemsCount = table.getRowCount()
    const pageSizeOptionsCollection = useMemo(() => {
        return createListCollection({
            items: pageSizeOptions.map(item => ({
                label: `${item}`,
                value: `${item}`,
            })),
        })
    }, [pageSizeOptions]);
    const values = useMemo(() => {
        return [`${pageSize}`]
    }, [pageSize]);
    return (
        <HStack
            mt={4}
            spaceX={3}
            spaceY={3}
            align="center"
            flexWrap={"wrap"}
            bg={useColorModeValue("gray.50", "gray.800")}
            p={3}
            borderRadius="md"
            w="100%"
        >
            {/* first / previous */}
            <IconButton
                aria-label="First page"
                size="xs"
                variant="ghost"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
            >
                <HiChevronDoubleLeft />
            </IconButton>
            <PaginationRoot
                page={pageIdx + 1}        /* Chakra is 1-based */
                pageSize={pageSize}
                count={itemsCount}
                onPageChange={(p) => table.setPageIndex(p.page - 1)}
                size="xs"
                variant="outline"
            >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
            </PaginationRoot>
            <IconButton
                aria-label="Last page"
                size="xs"
                variant="ghost"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
            >
                <HiChevronDoubleRight />
            </IconButton>

            {/* compact “Page x of y” text */}
            {/* <PaginationPageText ml={1} fontSize="xs" /> */}

            {/* <Spacer /> */}

            <div>
                <Select.Root
                    positioning={{ sameWidth: false }}
                    collection={pageSizeOptionsCollection}
                    value={values}
                    onValueChange={(value) => {
                        const pageSize = parseInt(value.value[0])
                        table.setPageSize(pageSize)
                    }}
                    size="xs"
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger >
                            <Select.ValueText minW="5" textAlign={"center"}/>
                        </Select.Trigger>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content minW="32">
                                {pageSizeOptionsCollection.items.map((item) => (
                                    <Select.Item item={item} key={item.value}>
                                        <HStack>
                                            {item.label}
                                        </HStack>
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
            </div>
        </HStack>
    )
}

export default DataTablePagination;
