"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";

export type OrderedField = {
  _id: string;
  label?: string;
  name?: string;
  type?: string;
};

export type FieldOrderLabels = {
  title: string;
  description: string;
  drag: (label: string) => string;
  moveUp: (label: string) => string;
  moveDown: (label: string) => string;
  saving: string;
  empty: string;
};

type Props = {
  fieldIds: string[];
  fields: OrderedField[];
  disabled?: boolean;
  labels: FieldOrderLabels;
  onChange: (fieldIds: string[]) => void;
  onPersist: (fieldIds: string[]) => Promise<boolean | void>;
  onSuccess?: () => void;
  onError?: () => void;
};

export const reorderFieldIds = (
  fieldIds: string[],
  activeId: string,
  overId: string
) => {
  const oldIndex = fieldIds.indexOf(activeId);
  const newIndex = fieldIds.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return fieldIds;
  return arrayMove(fieldIds, oldIndex, newIndex);
};

export default function FormFieldOrderer({
  fieldIds,
  fields,
  disabled = false,
  labels,
  onChange,
  onPersist,
  onSuccess,
  onError,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const fieldById = useMemo(
    () => new Map(fields.map((field) => [field._id, field])),
    [fields]
  );
  const locked = disabled || isSaving;

  const commit = async (next: string[]) => {
    if (locked || next === fieldIds || next.every((id, index) => id === fieldIds[index])) {
      return;
    }
    const previous = [...fieldIds];
    onChange(next);
    setIsSaving(true);
    try {
      const persisted = await onPersist(next);
      if (persisted !== false) onSuccess?.();
    } catch {
      onChange(previous);
      onError?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    void commit(reorderFieldIds(fieldIds, String(active.id), String(over.id)));
  };

  const move = (fieldId: string, delta: -1 | 1) => {
    const index = fieldIds.indexOf(fieldId);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= fieldIds.length) return;
    void commit(arrayMove(fieldIds, index, target));
  };

  if (fieldIds.length === 0) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  const activeField = activeId ? fieldById.get(activeId) : undefined;

  return (
    <section className="col-span-2 space-y-3" aria-labelledby="field-order-title">
      <div>
        <h3 id="field-order-title" className="text-sm font-medium">
          {labels.title}
        </h3>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        autoScroll
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2" aria-busy={isSaving}>
            {fieldIds.map((fieldId, index) => {
              const field = fieldById.get(fieldId);
              return (
                <SortableField
                  key={fieldId}
                  id={fieldId}
                  label={field?.label || field?.name || fieldId}
                  type={field?.type}
                  index={index}
                  count={fieldIds.length}
                  disabled={locked}
                  labels={labels}
                  onMove={move}
                />
              );
            })}
          </ol>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeField ? (
            <div className="rounded-md border-2 border-primary bg-background px-3 py-2 shadow-lg">
              {activeField.label || activeField.name || activeField._id}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="min-h-5 text-sm text-muted-foreground" role="status" aria-live="polite">
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {labels.saving}
          </span>
        ) : null}
      </div>
    </section>
  );
}

type SortableFieldProps = {
  id: string;
  label: string;
  type?: string;
  index: number;
  count: number;
  disabled: boolean;
  labels: FieldOrderLabels;
  onMove: (id: string, delta: -1 | 1) => void;
};

function SortableField({
  id,
  label,
  type,
  index,
  count,
  disabled,
  labels,
  onMove,
}: SortableFieldProps) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, isDragging } =
    useSortable({ id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      className={
        "flex min-h-12 items-center gap-2 rounded-md border bg-background p-2 motion-reduce:transition-none " +
        (isDragging ? "border-primary opacity-50 ring-2 ring-primary/30" : "")
      }
      data-testid={`ordered-field-${id}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="flex size-11 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={labels.drag(label)}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden="true" />
      </button>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        {type ? <span className="block text-xs text-muted-foreground">{type}</span> : null}
      </span>
      <span className="text-sm tabular-nums text-muted-foreground" aria-hidden="true">
        {index + 1}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={labels.moveUp(label)}
        disabled={disabled || index === 0}
        onClick={() => onMove(id, -1)}
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={labels.moveDown(label)}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(id, 1)}
      >
        <ArrowDown className="size-4" aria-hidden="true" />
      </Button>
    </li>
  );
}
