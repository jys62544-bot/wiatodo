import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AppSettings, StoreState, WidgetMode } from "../types/settings";
import type { TodoItem } from "../types/todo";
import { createDefaultState, loadState, saveState } from "../services/storageService";
import {
  addTodo,
  addTodosBatch,
  clearCompleted,
  completeTodo,
  deleteTodo,
  reopenTodo,
  toggleImportant,
} from "../services/todoDomain";

type Action =
  | { type: "hydrate"; state: StoreState }
  | { type: "addTodo"; title: string }
  | { type: "addTodosBatch"; titles: string[] }
  | { type: "deleteTodo"; id: string }
  | { type: "completeTodo"; id: string }
  | { type: "reopenTodo"; id: string }
  | { type: "toggleImportant"; id: string }
  | { type: "clearCompleted" }
  | { type: "setWidgetMode"; mode: WidgetMode }
  | { type: "setLocked"; isLocked: boolean }
  | { type: "toggleLocked" }
  | { type: "saveWindowPosition"; position: { x: number; y: number } }
  | { type: "setPanelSize"; size: { width: number; height: number } };

interface AppStateContextValue {
  state: StoreState;
  todos: TodoItem[];
  settings: AppSettings;
  isHydrated: boolean;
  addTodo: (title: string) => void;
  addTodosBatch: (titles: string[]) => void;
  deleteTodo: (id: string) => void;
  completeTodo: (id: string) => void;
  reopenTodo: (id: string) => void;
  toggleImportant: (id: string) => void;
  clearCompleted: () => void;
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
  const completeTodoAction = useCallback((id: string) => dispatch({ type: "completeTodo", id }), []);
  const reopenTodoAction = useCallback((id: string) => dispatch({ type: "reopenTodo", id }), []);
  const toggleImportantAction = useCallback((id: string) => dispatch({ type: "toggleImportant", id }), []);
  const clearCompletedAction = useCallback(() => dispatch({ type: "clearCompleted" }), []);
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
      todos: state.todos,
      settings: state.settings,
      isHydrated,
      addTodo: addTodoAction,
      addTodosBatch: addTodosBatchAction,
      deleteTodo: deleteTodoAction,
      completeTodo: completeTodoAction,
      reopenTodo: reopenTodoAction,
      toggleImportant: toggleImportantAction,
      clearCompleted: clearCompletedAction,
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
      flushStateAction,
      isHydrated,
      reopenTodoAction,
      saveWindowPositionAction,
      setLockedAction,
      setPanelSizeAction,
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
      return { ...state, todos: addTodo(state.todos, action.title) };
    case "addTodosBatch":
      return { ...state, todos: addTodosBatch(state.todos, action.titles) };
    case "deleteTodo":
      return { ...state, todos: deleteTodo(state.todos, action.id) };
    case "completeTodo":
      return { ...state, todos: completeTodo(state.todos, action.id) };
    case "reopenTodo":
      return { ...state, todos: reopenTodo(state.todos, action.id) };
    case "toggleImportant":
      return { ...state, todos: toggleImportant(state.todos, action.id) };
    case "clearCompleted":
      return { ...state, todos: clearCompleted(state.todos) };
    case "setWidgetMode":
      return { ...state, settings: { ...state.settings, widgetMode: action.mode } };
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
