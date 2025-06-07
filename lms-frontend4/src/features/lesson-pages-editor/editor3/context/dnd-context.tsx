import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";

interface SortableBlockWrapperProps {
  id: string;
  children: ReactNode;
  dragHandle: ReactNode;
  isDragging: boolean;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

export function SortableBlockWrapper({
  id,
  children,
  dragHandle,
  isDragging,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: SortableBlockWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-1 rounded-md ${isDragging ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Drag handle on the left */}
      <div
        className={`absolute -left-15 top-1/2 -translate-y-1/2 ml-1 z-10 transition-opacity ${
          isSelected || isHovered ? "opacity-100" : "opacity-0"
        }`}
        {...attributes}
        {...listeners}
      >
        {dragHandle}
      </div>
      {children}
    </div>
  );
}

export function useDndHandlers<T extends { id: string }>(
  blocks: T[],
  setBlocks: (blocks: T[]) => void
) {
  const activeBlockIdRef = useRef<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    activeBlockIdRef.current = event.active.id as string;
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        const updatedBlocks = [...blocks];
        const [movedItem] = updatedBlocks.splice(oldIndex, 1);
        updatedBlocks.splice(newIndex, 0, movedItem);

        setBlocks(updatedBlocks);
      }
      activeBlockIdRef.current = null;
    },
    [blocks, setBlocks]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    activeBlockId: activeBlockIdRef.current,
  };
}

export const DndWrapper = ({
  children,
  sensors,
  onDragStart,
  onDragEnd,
  items,
}: {
  children: ReactNode;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: (e: DragStartEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
  items: string[];
}) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};
