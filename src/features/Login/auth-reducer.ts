import { authAPI, LoginParamsType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";
import {tasksaction} from "../TodolistsList/tasks-reducer";
import {todoliststaction} from "../TodolistsList/todolists-reducer";
import {clearTasksAndTodolists} from "../../common/actions/clearTasksAndTodolists";

const slice=createSlice({
  name:'auth',
  initialState: {isLoggedIn: false},
  reducers: {
    setIsLoggedIn:(state,action:PayloadAction<{ isLoggedIn: boolean }>)=>{
    state.isLoggedIn=action.payload.isLoggedIn
    }
  }
})

// thunks
export const loginTC =
  (data: LoginParamsType):AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({ status:"loading" }));
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedIn({isLoggedIn:true}));
          dispatch(appActions.setAppStatus({ status:"succeeded" }));

        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const logoutTC = ():AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({ status:"loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedIn({isLoggedIn:false}));
        dispatch(appActions.setAppStatus({ status:"succeeded" }));
          dispatch(clearTasksAndTodolists({todolists:[],tasks:{}}))

      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};

export const authReducer=slice.reducer
export const authActions = slice.actions
