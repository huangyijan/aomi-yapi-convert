import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './js/index'
import {config} from './mock'

export enum Type {
    Simple,
    Normal,
    Ts
}

export const getDocByType = (type: Type, config: ApiConfig, url: string, project: ProjectConfig) => {
    switch (type) {
    case Type.Simple:
        getApiDocWithNoNote(url, config, project)
        break
    case Type.Normal:
        getApiDocWithJsDoc(url, config, project)
        break
    }
}

export const main = (config: ApiConfig) => {
    const { protocol, host, isNeedType, projects } = config
    projects.forEach(item => {
        const { projectId } = item
        const baseUrl = `${protocol}//${host}`
        const jsonUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false`
        const menuUrl = `${baseUrl}/api/interface/list_menu?project_id=${projectId}`
        if (isNeedType) {
            getDocByType(Type.Normal, config, jsonUrl, item)
        } else {
            getDocByType(Type.Simple, config, menuUrl, item)
        }
    })
}




const { NODE_ENV} = process.env
if(NODE_ENV === 'development') main(config as ApiConfig)
