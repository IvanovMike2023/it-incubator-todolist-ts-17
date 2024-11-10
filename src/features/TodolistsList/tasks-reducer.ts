import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { AppRootStateType, AppThunk } from "app/store";
import { appActions, SetAppErrorActionType, SetAppStatusActionType } from "app/app-reducer";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todoliststaction } from "features/TodolistsList/todolists-reducer";
import {clearTasksAndTodolists} from "../../common/actions/clearTasksAndTodolists";

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      const tasksForCurrentTodolist = state[action.payload.todolistId];
      const index = tasksForCurrentTodolist.findIndex((todo) => todo.id === action.payload.taskId);
      if (index !== -1) tasksForCurrentTodolist.splice(index, 1);
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      const tasksForCurrentTodolist = state[action.payload.task.todoListId];
      tasksForCurrentTodolist.unshift(action.payload.task);
    },
    updateTask: (
      state,
      action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
    ) => {
      const tasksForCurrentTodolist = state[action.payload.todolistId];
      const index = tasksForCurrentTodolist.findIndex((todo) => todo.id === action.payload.taskId);
      if (index !== -1) {
        tasksForCurrentTodolist[index] = { ...tasksForCurrentTodolist[index], ...action.payload.model };
      }
    },
    setTask: (state, action: PayloadAction<{ tasks: TaskType[]; todolistId: string }>) => {
      state[action.payload.todolistId] = action.payload.tasks;
    },
  },
  extraReducers: (bilder) => {
    bilder.addCase(todoliststaction.addTodolist, (state, action) => {
      state[action.payload.todolist.id] = [];
    });
    bilder.addCase(todoliststaction.removeTodolist, (state, action) => {
      delete state[action.payload.todolistId];
    });
    bilder.addCase(todoliststaction.setTodolists, (state, action) => {
      action.payload.todolists.forEach((tl) => {
        state[tl.id] = [];
      });
    });
    bilder.addCase(clearTasksAndTodolists,(state, action)=>{
      return {}
    })
  },
});
export const tasksReducer = slice.reducer;
export const tasksaction = slice.actions;

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
  dispatch(appActions.setAppStatus({ status: "loading" }));
  todolistsAPI.getTasks(todolistId).then((res) => {
    const tasks = res.data.items;
    dispatch(tasksaction.setTask({ tasks: tasks, todolistId: todolistId }));
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
  });
};
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
  todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
    const action = tasksaction.removeTask({ taskId: taskId, todolistId: todolistId });
    dispatch(action);
  });
};
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
  dispatch(appActions.setAppStatus({ status: "loading" }));
  todolistsAPI
    .createTask(todolistId, title)
    .then((res) => {
      if (res.data.resultCode === 0) {
        const task = res.data.data.item;
        const action = tasksaction.addTask({ task: task });
        dispatch(action);
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState: () => AppRootStateType) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const action = tasksaction.updateTask({ taskId: taskId, model: domainModel, todolistId: todolistId });
          dispatch(action);
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
