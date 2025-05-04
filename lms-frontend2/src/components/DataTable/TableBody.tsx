import { Skeleton, Table } from "@chakra-ui/react";
import { flexRender, Table as TableType } from "@tanstack/react-table";

interface Props<T> {
    table: TableType<T>
    loading: boolean;
}

const TableBody = <T,>({ table, loading }: Props<T>) => {
    return (
        <Table.Body>
            {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id} >
                    {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id} truncate maxW="sm">
                            <Skeleton height="6" loading={loading}>
                                {!loading && flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </Skeleton>
                        </Table.Cell>
                    ))}
                </Table.Row>
            ))}
        </Table.Body>
    );
}

export default TableBody;