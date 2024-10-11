import { Dispatch } from "redux";
import { authAPI } from "../api/todolists-api";
import {authActions } from "../features/Login/auth-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";

const slice=createSlice({
  name: 'app',
  initialState: {status: "idle" as RequestStatusType,
    error: null as string | null,
    isInitialized: false,},
  reducers:{
    setAppError:(state,actions: PayloadAction<{error: RequestStatusTypeError}>)=>{
      state.error=actions.payload.error
    },
    setAppStatus:(state,actions:PayloadAction<{status: RequestStatusType }>)=>{
      state.status=actions.payload.status
    },
    setAppInitialized:(state,actions:PayloadAction<{value:boolean}>)=>{
      state.isInitialized=actions.payload.value
    }
  },


})

export type SetAppErrorActionType = ReturnType<typeof appActions.setAppError>
export type SetAppStatusActionType = ReturnType<typeof appActions.setAppStatus>
export type RequestStatusTypeError = string | null;
export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";




export const initializeAppTC = ():AppThunk => (dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      dispatch(authActions.setIsLoggedIn({isLoggedIn:true}));
    } else {
    }

    dispatch(appActions.setAppInitialized({value:true}));
  });
};


export const appReducer=slice.reducer
export const initialState1=  slice.getInitialState()
export type initializeState = ReturnType<typeof slice.getInitialState>
export const appActions=slice.actions