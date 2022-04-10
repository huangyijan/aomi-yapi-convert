import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './js/index'


const baseUrl = 'http://yapi.miguatech.com' // 基礎前綴
const demoUrl = baseUrl + '/api/interface/list?page=1&limit=200&project_id=445' // 接口分頁
const projectMenuUrl = baseUrl + '/api/interface/list_menu?project_id=445' // 菜單列表
const jsonUrl = 'http://yapi.miguatech.com/api/plugin/export?type=json&pid=445&status=all&isWiki=false'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjQ3NDA1MjA0LCJleHAiOjE2NDgwMTAwMDR9.2IIdw5ZFCzxHLoOwRay4Sn76M1pz7uXMwOO9CVwSR8c'
enum Type {
    Simple,
    Normal,
    Ts
}

const getDocByType = (type: Type) => {
    switch (type) {
    case Type.Simple:
        getApiDocWithNoNote(projectMenuUrl, token)
        break
    case Type.Normal:
        // getApiDocWithJsDoc(jsonUrl)
        getApiDocWithJsDoc('./api/fullApi.js')
        break
    }
}

getDocByType(Type.Normal)