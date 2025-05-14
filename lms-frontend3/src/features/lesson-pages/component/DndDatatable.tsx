import type { DocumentBase } from "@/client";
import type { DatatableProps } from "@/components/datatable";
import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";

interface DndDatatableProps<T extends DocumentBase> extends DatatableProps<T> {
  onReorder: (data: T[]) => void;
}

export function DndDatatable<T extends DocumentBase>({
  resource,
  onReorder,
}: DndDatatableProps<T>) {
  const { datatable } = resource;
  const columns = datatable.table.getAllColumns();

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => resource.data?.map(({ id }) => `${id}`),
    [resource.data]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const prevData = resource.data;
      const oldIndex = prevData.findIndex((item) => `${item.id}` === active.id);
      const newIndex = prevData.findIndex((item) => `${item.id}` === over.id);
      const newData = arrayMove([...prevData], oldIndex, newIndex);
      const updatedData = newData.map((item, index) => ({
        ...item,
        order: newData.length - index, // descending order
      }));
      datatable.dataControl.set(updatedData);
      onReorder(updatedData);
    }
  };

  return (
    <div className="space-y-4">
      {/* <DataTableToolbar table={datatable.table} /> */}
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              {datatable.table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const classes = useMemo(() => {
                      return cn(
                        header.column.columnDef.meta?.sizeBorderStyle
                          ? cn(
                              "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                              "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                              "sticky left-6 md:table-cell"
                            )
                          : "",
                        header.column.columnDef.meta?.className || ""
                      );
                    }, [header.column.columnDef.meta]);
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={classes}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <DataTableColumnHeader
                            column={header.column}
                            title={String(header.column.columnDef.header)}
                          />
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {resource.data.length > 0 ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {datatable.table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}

function DraggableRow<T extends DocumentBase>({ row }: { row: Row<T> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${row.original.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? "relative" : "static",
    backgroundColor: isDragging ? "var(--accent)" : undefined,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group/row ${row.getIsSelected() ? "bg-muted/50" : ""}`}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => {
        const classes = cn(
          cell.column.columnDef.meta?.sizeBorderStyle
            ? cn(
                "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none",
                "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                "sticky left-6 md:table-cell"
              )
            : "",
          cell.column.columnDef.meta?.className || ""
        );
        return (
          <TableCell key={cell.id} className={classes}>
            {cell.column.id === "dragHandle" ? (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
