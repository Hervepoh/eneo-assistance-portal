import {  RoleModel } from "../../database/models"

export type RoleType = RoleModel & {
    permissions: {id:number,name:string}[]
}