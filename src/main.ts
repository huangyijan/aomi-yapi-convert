import { getApiDoc } from './simple/index'
import { saveFile } from './utils/saveFile'
import { request } from './utils/request'
const baseUrl = 'http://yapi.miguatech.com' // 基礎前綴
const demoUrl = baseUrl + '/api/interface/list?page=1&limit=200&project_id=445' // 接口分頁
const projectMenuUrl = baseUrl + '/api/interface/list_menu?project_id=445' // 菜單列表

getApiDoc(projectMenuUrl)

const getFullDoc = async (url: string) => {
    const file = await request(url) as any
    saveFile('./api/fullApi.js', file)

}

// getFullDoc('http://yapi.miguatech.com/api/plugin/export?type=json&pid=567&status=all&isWiki=false')