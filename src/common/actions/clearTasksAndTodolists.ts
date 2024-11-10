import {createAction} from "@reduxjs/toolkit";
import {TodolistDomainType} from "../../features/TodolistsList/todolists-reducer";
export type clearTasksAndTodolistsType={
    tasks:{},
    todolists:TodolistDomainType[]
}
export const clearTasksAndTodolists= createAction<clearTasksAndTodolistsType>('common/clear-tasks-todolists')
