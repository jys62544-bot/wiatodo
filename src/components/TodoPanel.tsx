import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { getCompletedTodos, getPendingTodos } from "../services/todoDomain";
import { startWindowDrag } from "../services/windowService";
import { useAppState } from "../store/AppStateContext";
import type { TodoScope } from "../types/todo";
import { CompletedList } from "./CompletedList";
import { HeaderBar } from "./HeaderBar";
import { ImportModal } from "./ImportModal";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export function TodoPanel() {
  const {
    todos,
    todoGroups,
    activeTodoScope,
    settings,
    addTodo,
    addTodosBatch,
    deleteTodo,
    editTodo,
    completeTodo,
    reopenTodo,
    toggleImportant,
    reorderTodo,
    clearCompleted,
    setTodoScope,
    setWidgetMode,
    toggleLocked,
  } = useAppState();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const pendingTodos = useMemo(() => getPendingTodos(todos), [todos]);
  const completedTodos = useMemo(() => getCompletedTodos(todos), [todos]);
  const pendingCounts = useMemo(
    () => ({
      shortTerm: getPendingTodos(todoGroups.shortTerm).length,
      longTerm: getPendingTodos(todoGroups.longTerm).length,
    }),
    [todoGroups],
  );

  function collapseToIcon() {
    setWidgetMode("floating_icon");
  }

  function hideToTray() {
    setWidgetMode("hidden_to_tray");
  }

  return (
    <main className="mx-auto flex h-screen w-screen max-w-[420px] flex-col overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-slate-900 shadow-xl">
      <HeaderBar
        pendingCount={pendingTodos.length}
        isLocked={settings.isLocked}
        onCollapse={collapseToIcon}
        onHideToTray={hideToTray}
        onStartDrag={() => startWindowDrag().catch((error) => console.warn("start panel dragging failed", error))}
        onToggleLocked={toggleLocked}
      />
      <section className="border-b border-slate-100 px-4 py-3">
        <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-white p-1">
          <TodoScopeButton
            scope="longTerm"
            label="长期待办"
            count={pendingCounts.longTerm}
            activeScope={activeTodoScope}
            onSelect={setTodoScope}
          />
          <TodoScopeButton
            scope="shortTerm"
            label="短期待办"
            count={pendingCounts.shortTerm}
            activeScope={activeTodoScope}
            onSelect={setTodoScope}
          />
        </div>
      </section>
      <section className="space-y-3 border-b border-slate-100 px-4 py-3">
        <TodoInput onAdd={addTodo} />
        <button className="btn-secondary w-full justify-center" type="button" onClick={() => setIsImportOpen(true)}>
          <ClipboardList size={15} />
          <span>批量导入</span>
        </button>
      </section>
      <section className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-normal text-slate-400">待办 {pendingTodos.length}</h2>
          <TodoList
            todos={pendingTodos}
            onComplete={completeTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onReorder={reorderTodo}
            onToggleImportant={toggleImportant}
          />
        </div>
        <CompletedList
          todos={completedTodos}
          onReopen={reopenTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
          onClearCompleted={clearCompleted}
        />
      </section>
      {isImportOpen ? <ImportModal onClose={() => setIsImportOpen(false)} onImport={addTodosBatch} /> : null}
    </main>
  );
}

interface TodoScopeButtonProps {
  scope: TodoScope;
  label: string;
  count: number;
  activeScope: TodoScope;
  onSelect: (scope: TodoScope) => void;
}

function TodoScopeButton({ scope, label, count, activeScope, onSelect }: TodoScopeButtonProps) {
  const isActive = activeScope === scope;

  return (
    <button
      className={`flex h-8 items-center justify-center gap-1.5 rounded px-2 text-sm font-medium transition ${
        isActive
          ? "bg-blue-500 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(scope)}
    >
      <span>{label}</span>
      <span className={`tabular-nums ${isActive ? "text-blue-100" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}
