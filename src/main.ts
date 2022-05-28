import { getApiDocWithNoNote } from './simple/index'
import { getApiDocWithJsDoc } from './prompt/index'
import { handleApiRequestError, request } from './utils/request'
import { getApiToken } from './utils/file'


export default async (config: ApiConfig) => {
    global.apiConfig = config // 注册全局配置
    const { protocol, host, isNeedType, projects } = config
    const baseUrl = `${protocol}//${host}`
    const token = getApiToken()
    
    projects.forEach(project => {
        const { projectId } = project
        const projectConfigUrl = `${baseUrl}/api/project/get?id=${projectId}`
        
        request(projectConfigUrl, token)
            .then(projectConfigStr => {
                const projectConfig = JSON.parse(projectConfigStr)
                project.projectBaseConfig = projectConfig.data
                if (isNeedType) {
                    project.requestUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false` // jsonUrl
                    getApiDocWithJsDoc(project.requestUrl, project)
                } else {
                    project.requestUrl = `${baseUrl}/api/interface/list_menu?project_id=${projectId}` // menuUrl
                    getApiDocWithNoNote(project.requestUrl, project)

                }
            })
            .catch(error => {
                handleApiRequestError(String(error))
            })

    })
}


