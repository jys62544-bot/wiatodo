import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AppSettings, StoreState, WidgetMode } from "../types/settings";
import type { TodoGroups, TodoItem, TodoScope } from "../types/todo";
import { createDefaultState, loadState, saveState } from "../services/storageService";
import {
  addTodo,
  addTodosBatch,
  clearCompleted,
  completeTodo,
  deleteTodo,
  editTodo,
  reorderTodo,
  reopenTodo,
  toggleImportant,
} from "../services/todoDomain";

type Action =
  | { type: "hydrate"; state: StoreState }
  | { type: "addTodo"; title: string }
  | { type: "addTodosBatch"; titles: string[] }
  | { type: "deleteTodo"; id: string }
  | { type: "editTodo"; id: string; title: string }
  | { type: "completeTodo"; id: string }
  | { type: "reopenTodo"; id: string }
  | { type: "toggleImportant"; id: string }
  | { type: "reorderTodo"; draggedId: string; targetId: string; placement: "before" | "after" }
  | { type: "clearCompleted" }
  | { type: "setTodoScope"; scope: TodoScope }
  | { type: "setWidgetMode"; mode: WidgetMode }
  | { type: "setLocked"; isLocked: boolean }
  | { type: "toggleLocked" }
  | { type: "saveWindowPosition"; position: { x: number; y: number } }
  | { type: "setPanelSize"; size: { width: number; height: number } };

interface AppStateContextValue {
  state: StoreState;
  todos: TodoItem[];
  todoGroups: TodoGroups;
  activeTodoScope: TodoScope;
  settings: AppSettings;
  isHydrated: boolean;
  addTodo: (title: string) => void;
  addTodosBatch: (titles: string[]) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  completeTodo: (id: string) => void;
  reopenTodo: (id: string) => void;
  toggleImportant: (id: string) => void;
  reorderTodo: (draggedId: string, targetId: string, placement: "before" | "after") => void;
  clearCompleted: () => void;
  setTodoScope: (scope: TodoScope) => void;
  setWidgetMode: (mode: WidgetMode) => void;
  setLocked: (isLocked: boolean) => void;
  toggleLocked: () => void;
  saveWindowPosition: (position: { x: number; y: number }) => void;
  setPanelSize: (size: { width: number; height: number }) => void;
  flushState: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createDefaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    loadState().then((loadedState) => {
      if (!cancelled) {
        dispatch({ type: "hydrate", state: loadedState });
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      saveState(state).catch((error) => {
        console.warn("Failed to save state", error);
      });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isHydrated, state]);

  const addTodoAction = useCallback((title: string) => dispatch({ type: "addTodo", title }), []);
  const addTodosBatchAction = useCallback((titles: string[]) => dispatch({ type: "addTodosBatch", titles }), []);
  const deleteTodoAction = useCallback((id: string) => dispatch({ type: "deleteTodo", id }), []);
  const editTodoAction = useCallback((id: string, title: string) => dispatch({ type: "editTodo", id, title }), []);
  const completeTodoAction = useCallback((id: string) => dispatch({ type: "completeTodo", id }), []);
  const reopenTodoAction = useCallback((id: string) => dispatch({ type: "reopenTodo", id }), []);
  const toggleImportantAction = useCallback((id: string) => dispatch({ type: "toggleImportant", id }), []);
  const reorderTodoAction = useCallback(
    (draggedId: string, targetId: string, placement: "before" | "after") =>
      dispatch({ type: "reorderTodo", draggedId, targetId, placement }),
    [],
  );
  const clearCompletedAction = useCallback(() => dispatch({ type: "clearCompleted" }), []);
  const setTodoScopeAction = useCallback((scope: TodoScope) => dispatch({ type: "setTodoScope", scope }), []);
  const setWidgetModeAction = useCallback((mode: WidgetMode) => dispatch({ type: "setWidgetMode", mode }), []);
  const setLockedAction = useCallback((isLocked: boolean) => dispatch({ type: "setLocked", isLocked }), []);
  const toggleLockedAction = useCallback(() => dispatch({ type: "toggleLocked" }), []);
  const saveWindowPositionAction = useCallback(
    (position: { x: number; y: number }) => dispatch({ type: "saveWindowPosition", position }),
    [],
  );
  const setPanelSizeAction = useCallback((size: { width: number; height: number }) => {
    dispatch({ type: "setPanelSize", size });
  }, []);
  const flushStateAction = useCallback(() => saveState(stateRef.current), []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      todos: state.todoGroups[state.settings.activeTodoScope],
      todoGroups: state.todoGroups,
      activeTodoScope: state.settings.activeTodoScope,
      settings: state.settings,
      isHydrated,
      addTodo: addTodoAction,
      addTodosBatch: addTodosBatchAction,
      deleteTodo: deleteTodoAction,
      editTodo: editTodoAction,
      completeTodo: completeTodoAction,
      reopenTodo: reopenTodoAction,
      toggleImportant: toggleImportantAction,
      reorderTodo: reorderTodoAction,
      clearCompleted: clearCompletedAction,
      setTodoScope: setTodoScopeAction,
      setWidgetMode: setWidgetModeAction,
      setLocked: setLockedAction,
      toggleLocked: toggleLockedAction,
      saveWindowPosition: saveWindowPositionAction,
      setPanelSize: setPanelSizeAction,
      flushState: flushStateAction,
    }),
    [
      addTodoAction,
      addTodosBatchAction,
      clearCompletedAction,
      completeTodoAction,
      deleteTodoAction,
      editTodoAction,
      flushStateAction,
      isHydrated,
      reorderTodoAction,
      reopenTodoAction,
      saveWindowPositionAction,
      setLockedAction,
      setPanelSizeAction,
      setTodoScopeAction,
      setWidgetModeAction,
      state,
      toggleImportantAction,
      toggleLockedAction,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}

export function usePersistWindowPosition() {
  const { saveWindowPosition } = useAppState();

  return useCallback(async () => {
    const { getWindowPosition } = await import("../services/windowService");
    const position = await getWindowPosition();

    if (position) {
      saveWindowPosition(position);
    }
  }, [saveWindowPosition]);
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "addTodo":
      return updateActiveTodos(state, (todos) => addTodo(todos, action.title));
    case "addTodosBatch":
      return updateActiveTodos(state, (todos) => addTodosBatch(todos, action.titles));
    case "deleteTodo":
      return updateActiveTodos(state, (todos) => deleteTodo(todos, action.id));
    case "editTodo":
      return updateActiveTodos(state, (todos) => editTodo(todos, action.id, action.title));
    case "completeTodo":
      return updateActiveTodos(state, (todos) => completeTodo(todos, action.id));
    case "reopenTodo":
      return updateActiveTodos(state, (todos) => reopenTodo(todos, action.id));
    case "toggleImportant":
      return updateActiveTodos(state, (todos) => toggleImportant(todos, action.id));
    case "reorderTodo":
      return updateActiveTodos(state, (todos) =>
        reorderTodo(todos, action.draggedId, action.targetId, action.placement),
      );
    case "clearCompleted":
      return updateActiveTodos(state, clearCompleted);
    case "setTodoScope":
      return { ...state, settings: { ...state.settings, activeTodoScope: action.scope } };
    case "setWidgetMode":
      return {
        ...state,
        settings: {
          ...state.settings,
          widgetMode: action.mode,
          activeTodoScope: action.mode === "todo_panel" ? "longTerm" : state.settings.activeTodoScope,
        },
      };
    case "setLocked":
      return { ...state, settings: { ...state.settings, isLocked: action.isLocked } };
    case "toggleLocked":
      return { ...state, settings: { ...state.settings, isLocked: !state.settings.isLocked } };
    case "saveWindowPosition":
      return { ...state, settings: { ...state.settings, windowPosition: action.position } };
    case "setPanelSize":
      return { ...state, settings: { ...state.settings, panelSize: action.size } };
    default:
      return state;
  }
}

function updateActiveTodos(state: StoreState, updater: (todos: TodoItem[]) => TodoItem[]): StoreState {
  const scope = state.settings.activeTodoScope;

  return {
    ...state,
    todoGroups: {
      ...state.todoGroups,
      [scope]: updater(state.todoGroups[scope]),
    },
  };
}
