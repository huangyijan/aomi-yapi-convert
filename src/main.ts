import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './prompt/index'
import {config} from './mock'
export enum Type {
    Simple,
    Normal,
    Ts
}

export const getDocByType = (type: Type,  url: string, project: ProjectConfig) => {
    switch (type) {
    case Type.Simple:
        getApiDocWithNoNote(url, project)
        break
    case Type.Normal:
        getApiDocWithJsDoc(url, project)
        break
    }
}

export const main = (config: ApiConfig) => {

    global.apiConfig = config // 注册全局配置

    const { protocol, host, isNeedType, projects } = config
    projects.forEach(item => {
        const { projectId } = item
        const baseUrl = `${protocol}//${host}`
        const jsonUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false`
        const menuUrl = `${baseUrl}/api/interface/list_menu?project_id=${projectId}`
        if (isNeedType) {
            getDocByType(Type.Normal,  jsonUrl, item)
        } else {
            getDocByType(Type.Simple,  menuUrl, item)
        }
    })
}




const { NODE_ENV} = process.env
if(NODE_ENV === 'development') main(config as ApiConfig)
