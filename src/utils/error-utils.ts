import { ResponseType } from "../api/todolists-api";
import { Dispatch } from "redux";
import { appActions, SetAppErrorActionType, SetAppStatusActionType } from "app/app-reducer";

export const handleServerAppError = <D>(
  data: ResponseType<D>,
  dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>,
) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({error: data.messages[0] }));
  } else {
    dispatch(appActions.setAppError({ error:"Some error occurred" }));
  }
  dispatch(appActions.setAppStatus({ status:"failed" }));
};

export const handleServerNetworkError = (
  error: {
    message: string;
  },
  dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>,
) => {
  dispatch(appActions.setAppError(error.message ? { error:error.message } : {error: "Some error occurred" }));
  dispatch(appActions.setAppStatus({ status:"failed" }));
};
