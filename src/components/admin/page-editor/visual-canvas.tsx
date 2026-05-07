"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableBlockShell } from "./sortable-block-shell";
import { InsertPoint } from "./insert-point";

export interface CanvasBlock {
  _clientId: string;
  type: string;
  data: Record<string, unknown>;
  isVisible: boolean;
}

interface VisualCanvasProps {
  blocks: CanvasBlock[];
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
  onChange: (clientId: string, data: Record<string, unknown>) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onToggleVisibility: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onDuplicate: (clientId: string) => void;
  onInsert: (type: string, atIndex: number) => void;
}

export function VisualCanvas({
  blocks,
  selectedClientId,
  onSelect,
  onChange,
  onReorder,
  onToggleVisibility,
  onDelete,
  onDuplicate,
  onInsert,
}: VisualCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b._clientId === active.id);
    const newIndex = blocks.findIndex((b) => b._clientId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(oldIndex, newIndex);
  }

  if (blocks.length === 0) {
    return <InsertPoint onInsert={(type) => onInsert(type, 0)} inline={false} />;
  }

  return (
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={blocks.map((b) => b._clientId)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, index) => {
            // arrayMove keeps insertion stable; pass through new index
            const id = block._clientId;
            return (
              <div key={id}>
                <SortableBlockShell
                  id={id}
                  type={block.type}
                  data={block.data}
                  isVisible={block.isVisible}
                  isSelected={id === selectedClientId}
                  onSelect={() => onSelect(id)}
                  onChange={(data) => onChange(id, data)}
                  onToggleVisibility={() => onToggleVisibility(id)}
                  onDelete={() => onDelete(id)}
                  onDuplicate={() => onDuplicate(id)}
                />
                {/* Inline insert point between blocks */}
                <div className="-my-0.5">
                  <InsertPoint onInsert={(type) => onInsert(type, index + 1)} />
                </div>
              </div>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Re-export arrayMove so the parent page can use it for its reorder handler
export { arrayMove };
