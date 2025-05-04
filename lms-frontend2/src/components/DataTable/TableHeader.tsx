import { FilterChangeFn, ItemsFieldFiltersState } from "@/client/types.gen";
import { Box, Flex, IconButton, Popover, Portal, Table } from "@chakra-ui/react";
import { flexRender, Table as TableType } from "@tanstack/react-table";
import { FiFilter } from "react-icons/fi";
import { FilterField } from "./FilterField";

interface Props<T> {
    table: TableType<T>
    loading: boolean;
    filters: ItemsFieldFiltersState;
    onFilterChange: FilterChangeFn<T>;
}

const TableHeader = <T,>({ table, filters, onFilterChange, }: Props<T>) => {
    return (
        <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        const fieldMeta = header.column.columnDef.meta
                        return (
                            <Table.ColumnHeader key={header.id} colSpan={header.colSpan}>
                                <Flex justify={"space-between"} align="center" gap={2}>
                                    {!header.isPlaceholder && (
                                        <>
                                            <Box
                                                cursor={header.column.getCanSort() ? "pointer" : "default"}
                                                userSelect="none"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {
                                                    header.column.getCanSort() ? (header.column.getIsSorted() === "asc"
                                                        ? " 🔼"
                                                        : header.column.getIsSorted() === "desc"
                                                            ? " 🔽"
                                                            : " 🔃") : null
                                                }
                                            </Box>
                                            {
                                                fieldMeta?.filter && (
                                                    <Popover.Root size={"sm"}>
                                                        <Popover.Trigger asChild>
                                                            <IconButton
                                                                size="xs"
                                                                aria-label="Filter column"
                                                                variant="ghost"
                                                                onClick={(e) => e.stopPropagation()} // don't toggle sort
                                                            >
                                                                <FiFilter />
                                                            </IconButton>
                                                        </Popover.Trigger>
                                                        <Portal>
                                                            <Popover.Positioner>
                                                                <Popover.Content>
                                                                    <Popover.Arrow />
                                                                    <Popover.Body>
                                                                        <FilterField<T>
                                                                            variant={fieldMeta.filter.variant}
                                                                            fieldMeta={fieldMeta}
                                                                            filters={filters}
                                                                            onFilterChange={onFilterChange}
                                                                        />
                                                                    </Popover.Body>
                                                                </Popover.Content>
                                                            </Popover.Positioner>
                                                        </Portal>
                                                    </Popover.Root>
                                                )
                                            }
                                        </>
                                    )}
                                </Flex>
                            </Table.ColumnHeader>
                        )
                    })}
                </Table.Row>
            ))}
        </Table.Header>
    );
}

export default TableHeader;