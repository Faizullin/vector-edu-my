import { simpleRequest } from '@/client/core/simpleRequest';
import TableHeader from '@/components/DataTable/TableHeader';
import { Button } from '@/components/ui/button';
import useFormChangeState from '@/hooks/useFormChangeState';
import { getActionsColumn } from '@/utils/table/getActionsColumn';
import { Container, Flex, Heading, Skeleton, Table } from '@chakra-ui/react';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { FiMenu } from 'react-icons/fi';

interface LessonPage {
  id: number;
  order: number;
  lesson: number;
  created_at: string;
  updated_at: string;
}

export const Route = createFileRoute('/_layout/lessons/$lessonId/pages')({
  component: RouteComponent,
})



const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners} style={{ cursor: 'grab' }}>
      <FiMenu />
    </button>
  )
}
const DraggableRow = ({ row, loading }: { row: Row<LessonPage>, loading: boolean }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: `${row.original.id}`,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }
  return (
    <Table.Row ref={setNodeRef} style={style}>
      {row.getVisibleCells().map(cell => (
        <Table.Cell key={cell.id} truncate maxW="sm">
          <Skeleton height="6" loading={loading}>
            {!loading && flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}
          </Skeleton>
        </Table.Cell>
      ))}
    </Table.Row >
  )
}

function RouteComponent() {
  const { lessonId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { data: lessonData } = useQuery<{
    id: number;
    title: string;
  }>({
    queryKey: ['lesson', lessonId],
    queryFn: () => simpleRequest({
      url: `/lessons/lessons/${lessonId}`,
      method: 'GET',
    }),
  });
  const changeState = useFormChangeState();
  const openPostEditorMutation = useMutation({
    mutationFn: (id: number) => {
      return simpleRequest({
        url: `/lessons/pages/${id}/get-editor/`,
        method: 'POST',
      });
    },
  });
  const columns = useMemo<ColumnDef<LessonPage>[]>(() => {
    return [
      {
        id: 'drag-handle',
        header: 'Move',
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        size: 60,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: false,
        // meta: {
        //   filter: {
        //     key: 'id',
        //     variant: 'text',
        //   }
        // }
      },
      {
        accessorKey: 'order',
        header: 'Order',
        enableSorting: false,
        // meta: {
        //   filter: {
        //     key: 'order',
        //     variant: 'text',
        //   }
        // }
      },
      getActionsColumn<LessonPage>({
        actions: [
          {
            render: ({
              row,
              key,
            }) => (
              <Button key={key} size="xs" variant="ghost"
                onClick={() => {
                  openPostEditorMutation.mutate(row.original.id, {
                    onSuccess: (data: any) => {
                      const postObj = data.post;
                      const url = `/resources/posts/${postObj.id}/edit-content?type=editor2&lesson_page_id=${lessonId}`;
                      window.open(url, '_blank');
                    }
                  });
                }}
                color={"blue.500"}>
                Open Editor
              </Button>
            ),
            displayType: "extra",
          },
        ]
      })
    ];
  }, [openPostEditorMutation, navigate]);
  const pagesQuery = useQuery<LessonPage[]>({
    queryKey: ['lesson', lessonId, 'pages'],
    queryFn: () => simpleRequest({
      url: `/lessons/pages/`,
      method: 'GET',
      query: {
        lesson: lessonId,
        disablePagination: true,
        ordering: '-order',
      },
    }),
  });
  const [data, setData] = useState<LessonPage[]>([]);
  const table = useReactTable<LessonPage>({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => `${row.id}`,
  });
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => `${id}`),
    [data]
  );
  useEffect(() => {
    if (pagesQuery.data) {
      setData(pagesQuery.data);
    }
  }, [pagesQuery.data]);
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = prevData.findIndex(item => `${item.id}` === `${active.id}`);
        const newIndex = prevData.findIndex(item => `${item.id}` === `${over.id}`);

        const newData = arrayMove([...prevData], oldIndex, newIndex);

        // Recalculate the order field
        const updatedData = newData.map((item, index) => ({
          ...item,
          order: newData.length - index, // descending order
        }));

        return updatedData;
      });
      if (!changeState.state) {
        changeState.setState(true);
      }
    }
  }, [dataIds, changeState]);
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const addPageMutation = useMutation({
    mutationFn: () => {
      return simpleRequest({
        url: `/lessons/pages/`,
        method: 'POST',
        formData: {
          lesson: lessonData!.id,
        },
      });
    },
    onSuccess: () => {
      pagesQuery.refetch();
    }
  });
  const saveOrderMutation = useMutation({
    mutationFn: () => {
      return simpleRequest({
        url: `/lessons/pages/reorder/`,
        method: 'POST',
        formData: {
          lesson_id: lessonData!.id,
          ordered_ids: dataIds.reverse(),
        },
      });
    },
    onSuccess: () => {
      pagesQuery.refetch();
      changeState.setState(false);
    }
  });
  const handleAddPage = useCallback(() => {
    addPageMutation.mutate();
  }, [addPageMutation]);
  const handleSaveOrder = useCallback(() => {
    saveOrderMutation.mutate();
  }, [saveOrderMutation]);
  return (
    <Container maxW="full" py={12}>
      <Flex
        mb={8}
        justify={"space-between"}
      >
        <Heading size="lg">
          Lesson "{lessonData?.title}" Pages
        </Heading>
        <Flex
          justify={"end"}
          align={"center"}>
          <Button
            ml="auto"
            size="xs"
            variant="solid"
            onClick={handleAddPage}
            disabled={addPageMutation.isPending}
          >
            Add Page
          </Button>
          <Button
            ml={2}
            size="xs"
            variant="solid"
            onClick={handleSaveOrder}
            disabled={addPageMutation.isPending || !changeState.state}
          >
            Save Order
          </Button>
        </Flex>
      </Flex>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table.Root size={{ base: "sm", md: "md" }}>
          <TableHeader
            table={table}
            loading={pagesQuery.isLoading} filters={{}}
            onFilterChange={() => { }} />
          <Table.Body>
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map(row => (
                <DraggableRow key={row.id} row={row} loading={pagesQuery.isLoading} />
              ))}
            </SortableContext>
          </Table.Body>
        </Table.Root>
      </DndContext>
    </Container>
  )
}
