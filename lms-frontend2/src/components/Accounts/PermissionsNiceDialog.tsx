import { LessonDocument, UserDocument } from "@/client/types.gen";
import { useResourceTable } from "@/hooks/useResource";
import { getActionsColumn } from "@/utils/table/getActionsColumn";
import { Dialog, Portal, Tabs } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "../DataTable/DataTable";
import NiceModal, { NiceModalHocProps, useModal } from "../NiceModal/NiceModal";
import { Button } from "../ui/button";
import { CloseButton } from "../ui/close-button";

type Tab = "permissions" | "lesson-user"

const col = createColumnHelper<LessonDocument>();

const ComponentsDict: Record<Tab, React.FC<{
    currentTab: Tab;
    user: UserDocument;
}>> = {
    permissions: () => {
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
                    getActionsColumn<LessonDocument>({}),
                ];
                return cols;
            }, [])
        const url = useMemo(() => {
            return `/lessons/lessons/`;
        }, []);
        const tableData = useResourceTable<LessonDocument>({
            endpoint: url,
            routeId: null,
            makeColumns: makeColumns,
        });
        return (
            <div>
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
                    }} />
            </div>
        )
    },
    "lesson-user": () => <div>Lesson User</div>,
}

export default NiceModal.create<{
    user: UserDocument;
    tab: Tab;
} & NiceModalHocProps>((props) => {
    const modal = useModal();
    const tabs: Array<{
        label: string;
        value: Tab;
    }> = [
            {
                label: "Permissions",
                value: "permissions",
            },
            {
                label: "Lesson User",
                value: "lesson-user",
            }
        ];
    const [currentTab, setCurrentTab] = useState<Tab>(tabs[0].value);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const tab = props.tab || tabs[0].value
        setCurrentTab(tab);
        setLoading(false);
    }, [props.tab]);
    return (
        <Dialog.Root size="full" motionPreset="slide-in-bottom" open={modal.visible} onOpenChange={({ open }) => open ? modal.show() : modal.hide()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Permissions Managemnt for {props.user.username}[#{props.user.id}]</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Tabs.Root value={currentTab} onValueChange={(e) => setCurrentTab(e.value as Tab)}>
                                <Tabs.List>
                                    {
                                        tabs.map((tab) => (
                                            <Tabs.Trigger key={tab.value} value={tab.value}>
                                                {tab.label}
                                            </Tabs.Trigger>
                                        ))
                                    }
                                </Tabs.List>
                                {
                                    tabs.map((tab) => {
                                        const Component = ComponentsDict[tab.value];
                                        return (
                                            <Tabs.Content key={tab.value} value={tab.value}>
                                                {loading ? <div>Loading...</div> : <Component currentTab={currentTab} user={props.user} />}
                                            </Tabs.Content>
                                        )
                                    })
                                }
                            </Tabs.Root>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button>Save</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="xs" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root >
    );
})