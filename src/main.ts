import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './js/index'


const baseUrl = 'http://yapi.miguatech.com' // 基礎前綴
const demoUrl = baseUrl + '/api/interface/list?page=1&limit=200&project_id=445' // 接口分頁
const projectMenuUrl = baseUrl + '/api/interface/list_menu?project_id=445' // 菜單列表
const jsonUrl = 'http://yapi.miguatech.com/api/plugin/export?type=json&pid=445&status=all&isWiki=false'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjQ5ODU5NzM0LCJleHAiOjE2NTA0NjQ1MzR9.hy77MubuqPcNTLKFxcpoagJ-6Xa3rtPRZOC7ul3M6Nc'
export enum Type {
    Simple,
    Normal,
    Ts
}

export const getDocByType = (type: Type, token: string, url: string) => {
    switch (type) {
    case Type.Simple:
        getApiDocWithNoNote(url, token)
        break
    case Type.Normal:
        getApiDocWithJsDoc(url, token)
        // getApiDocWithJsDoc('./api/fullApi.js')
        break
    }
}

const { NODE_ENV } = process.env
if(NODE_ENV === 'development') getDocByType(Type.Simple, token, jsonUrl)