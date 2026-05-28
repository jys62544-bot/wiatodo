import { PointerEvent, useEffect, useRef, useState } from "react";
import { calculateDragPreviewPosition, calculatePointerOffset } from "../services/dragPreview";
import type { TodoItem } from "../types/todo";
import { EmptyState } from "./EmptyState";
import { TodoItemRow } from "./TodoItemRow";

interface TodoListProps {
  todos: TodoItem[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onReorder: (draggedId: string, targetId: string, placement: "before" | "after") => void;
  onToggleImportant: (id: string) => void;
}

export function TodoList({ todos, onComplete, onDelete, onEdit, onReorder, onToggleImportant }: TodoListProps) {
  const [dragState, setDragState] = useState<{
    draggedId: string;
    targetId: string | null;
    placement: "before" | "after";
    pointer: { x: number; y: number };
    previewOffset: { x: number; y: number };
    previewSize: { width: number; height: number };
  } | null>(null);
  const dragStateRef = useRef(dragState);
  const draggedTodo = dragState ? todos.find((todo) => todo.id === dragState.draggedId) : null;

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
      const currentDrag = dragStateRef.current;

      if (!currentDrag) {
        return;
      }

      const targetRow = getTodoRowAtPoint(event.clientX, event.clientY);

      if (!targetRow) {
        setDragState({
          ...currentDrag,
          targetId: null,
          pointer: { x: event.clientX, y: event.clientY },
        });
        return;
      }

      const targetId = targetRow.dataset.todoId ?? null;

      if (!targetId || targetId === currentDrag.draggedId) {
        setDragState({
          ...currentDrag,
          targetId: null,
          pointer: { x: event.clientX, y: event.clientY },
        });
        return;
      }

      setDragState({
        draggedId: currentDrag.draggedId,
        targetId,
        placement: getDropPlacement(targetRow, event.clientY),
        pointer: { x: event.clientX, y: event.clientY },
        previewOffset: currentDrag.previewOffset,
        previewSize: currentDrag.previewSize,
      });
    }

    function handlePointerUp() {
      const currentDrag = dragStateRef.current;

      if (currentDrag?.targetId) {
        onReorder(currentDrag.draggedId, currentDrag.targetId, currentDrag.placement);
      }

      setDragState(null);
      document.body.classList.remove("select-none", "cursor-grabbing");
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    window.addEventListener("pointercancel", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.body.classList.remove("select-none", "cursor-grabbing");
    };
  }, [dragState, onReorder]);

  function handleStartReorder(todoId: string, event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const sourceRow = (event.currentTarget as HTMLElement).closest("[data-todo-id]") as HTMLElement | null;
    const sourceRect = sourceRow?.getBoundingClientRect();
    const pointer = { x: event.clientX, y: event.clientY };

    document.body.classList.add("select-none", "cursor-grabbing");
    setDragState({
      draggedId: todoId,
      targetId: null,
      placement: "before",
      pointer,
      previewOffset: sourceRect ? calculatePointerOffset(pointer, sourceRect) : { x: 10, y: 10 },
      previewSize: {
        width: Math.min(sourceRect?.width ?? 320, 360),
        height: sourceRect?.height ?? 44,
      },
    });
  }

  if (todos.length === 0) {
    return <EmptyState text="暂无待办，添加一个新的事项吧" />;
  }

  return (
    <>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItemRow
            key={todo.id}
            todo={todo}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onReopen={() => undefined}
            onStartReorder={handleStartReorder}
            dragPlacement={
              dragState?.targetId === todo.id && dragState.draggedId !== todo.id ? dragState.placement : null
            }
            isDragging={dragState?.draggedId === todo.id}
            onToggleImportant={onToggleImportant}
          />
        ))}
      </ul>
      {dragState && draggedTodo ? (
        <TodoDragPreview
          todo={draggedTodo}
          pointer={dragState.pointer}
          offset={dragState.previewOffset}
          size={dragState.previewSize}
        />
      ) : null}
    </>
  );
}

interface TodoDragPreviewProps {
  todo: TodoItem;
  pointer: { x: number; y: number };
  offset: { x: number; y: number };
  size: { width: number; height: number };
}

function TodoDragPreview({ todo, pointer, offset, size }: TodoDragPreviewProps) {
  const position = calculateDragPreviewPosition(pointer, offset);

  return (
    <div
      className={`pointer-events-none fixed z-50 flex items-start gap-2 rounded-md border px-2.5 py-2 text-sm leading-5 opacity-80 shadow-lg backdrop-blur-sm ${
        todo.isImportant ? "border-amber-300 bg-amber-50/90" : "border-blue-200 bg-white/90 text-slate-800"
      }`}
      style={{
        left: position.left,
        top: position.top,
        width: size.width,
        minHeight: size.height,
      }}
    >
      <span className="mt-0.5 h-5 w-4 shrink-0" />
      <p className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{todo.title}</p>
    </div>
  );
}

function getTodoRowAtPoint(x: number, y: number): HTMLElement | null {
  return (document.elementFromPoint(x, y) as HTMLElement | null)?.closest("[data-todo-id]") ?? null;
}

function getDropPlacement(element: HTMLElement, pointerY: number): "before" | "after" {
  const rect = element.getBoundingClientRect();
  return pointerY < rect.top + rect.height / 2 ? "before" : "after";
}
