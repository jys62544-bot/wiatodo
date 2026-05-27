import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { getCompletedTodos, getPendingTodos } from "../services/todoDomain";
import { startWindowDrag } from "../services/windowService";
import { useAppState } from "../store/AppStateContext";
import { CompletedList } from "./CompletedList";
import { HeaderBar } from "./HeaderBar";
import { ImportModal } from "./ImportModal";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export function TodoPanel() {
  const {
    todos,
    settings,
    addTodo,
    addTodosBatch,
    deleteTodo,
    completeTodo,
    reopenTodo,
    toggleImportant,
    clearCompleted,
    setWidgetMode,
    toggleLocked,
  } = useAppState();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const pendingTodos = useMemo(() => getPendingTodos(todos), [todos]);
  const completedTodos = useMemo(() => getCompletedTodos(todos), [todos]);

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
            onToggleImportant={toggleImportant}
          />
        </div>
        <CompletedList
          todos={completedTodos}
          onReopen={reopenTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
        />
      </section>
      {isImportOpen ? <ImportModal onClose={() => setIsImportOpen(false)} onImport={addTodosBatch} /> : null}
    </main>
  );
}
