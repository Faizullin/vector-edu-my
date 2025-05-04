import { IconButton, Menu, Portal } from "@chakra-ui/react";
import { DisplayColumnDef, Row } from "@tanstack/react-table";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPenTool, FiTrash } from "react-icons/fi";
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
export function getActionsColumn<T>(conf: {
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
    return {
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
                            <Menu.Root size={"sm"}>
                                <Menu.Trigger asChild>
                                    <IconButton variant="outline" size={"xs"}>
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
    } as DisplayColumnDef<T>;
}