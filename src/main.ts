import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './js/index'


const config = {
    'yapiURL': 'http://yapi.miguatech.com/project/445/interface/api',
    'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjQ5ODU5NzM0LCJleHAiOjE2NTA0NjQ1MzR9.hy77MubuqPcNTLKFxcpoagJ-6Xa3rtPRZOC7ul3M6Nc',
    'version': 'js',
    'isNeedType': true,
    'axiosFrom': 'import { fetch } from \'@/service/fetch/index\'',
    'protocol': 'http:',
    'host': 'yapi.miguatech.com',
    'projects': [
        {
            'projectId': '445',
            'outputDir': 'src/api/',
            'isLoadFullApi': false,
            'group': [
                {
                    'catId': 13540,
                    'name': '预售活动'
                },
                {
                    'catId': 14303,
                    'name': '拼团活动',
                    'fileName': 'index',
                    'outputDir': 'src/api/group/'
                },
                {
                    'catId': 15157,
                    'name': '搜索词'
                }
            ]
        }
    ]
}


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