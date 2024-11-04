import { todolistsAPI, TodolistType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { appActions, RequestStatusType, SetAppErrorActionType, SetAppStatusActionType } from "../../app/app-reducer";
import { handleServerNetworkError } from "../../utils/error-utils";
import { AppThunk } from "../../app/store";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { fetchTasksTC, tasksaction } from "features/TodolistsList/tasks-reducer";

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ todolistId: string }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.todolistId);
      if (index !== -1) state.splice(index, 1);
    },
    addTodolist: (state, actions: PayloadAction<{ todolist: TodolistType }>) => {
      const a = current(state);
      state.unshift({ ...actions.payload.todolist, filter: "all", entityStatus: "idle" });
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) state[index].title = action.payload.title;
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) state[index].filter = action.payload.filter;
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ todolistId: string; status: RequestStatusType }>) => {
      // state.map((tl) => (tl.id === actions.payload.todolistId ? { ...tl, entityStatus: actions.payload.status } : tl));
      debugger;
      const index = state.findIndex((todo) => todo.id === action.payload.todolistId);
      if (index !== -1) state[index].entityStatus = action.payload.status;
    },
    setTodolists: (state, actions: PayloadAction<{ todolists: TodolistType[] }>) => {
      return actions.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    },
  },
});

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todoliststaction.setTodolists({ todolists: res.data }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return res.data;
      })
      .then((res) => {
        res.forEach((el) => dispatch(fetchTasksTC(el.id)));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todoliststaction.changeTodolistEntityStatus({ todolistId, status: "loading" }));
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todoliststaction.removeTodolist({ todolistId }));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todoliststaction.addTodolist({ todolist: res.data.data.item }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch: Dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todoliststaction.changeTodolistTitle({ id, title }));
    });
  };
};

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
export const todolistsReducer = slice.reducer;
export const todoliststaction = slice.actions;
