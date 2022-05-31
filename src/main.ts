import { saveFile } from './utils/file'
import { configFileFoot, getApiFileConfig, getSavePath } from './utils/common'
import { handleApiRequestError, request } from './utils/request'
import { getApiToken } from './utils/file'

/**
 * 注册全局变量，node环境注册global里面的对象，browser环境注册global 到window对象
 * @param config 配置项
 */
const registerGlobal = (config: ApiConfig) => {
    if (global) {
        global.apiConfig = config // node注册全局配置
    } else {
        window.global.apiConfig = config // 浏览器注册全局变量
    }
}

/** 主流程：获取项目配置 => 获取接口json => 生成接口文档 */
export default async (config: ApiConfig) => {
    registerGlobal(config)
    const { protocol, host, projects } = config
    const baseUrl = `${protocol}//${host}`
    const token = getApiToken()
    
    projects.forEach(project => {
        const { projectId } = project
        const projectConfigUrl = `${baseUrl}/api/project/get?id=${projectId}`
        
        request(projectConfigUrl, token)
            .then(projectConfigStr => {
                const projectConfig = JSON.parse(projectConfigStr)
                project.projectBaseConfig = projectConfig.data
                project.requestUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false` // jsonUrl
                return request(project.requestUrl, token)
            })
            .then(fileString => {
                const commonJson = JSON.parse(fileString)
                generatorFileList(commonJson, project)
            })
            .catch(error => {
                handleApiRequestError(String(error))
            })

    })
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const generatorFileList = (data: Array<JsDocMenuItem>, project: ProjectConfig) => {
    const nameChunk = new Map() // 用来处理文件命名的容器
    const { group, isLoadFullApi } = project
    const hasSaveNames: string[] = [] // 处理已经命名的容器

    data.forEach((item: JsDocMenuItem) => {
        const { FileName, fileBufferStringChunk, noteStringChunk } = getApiFileConfig(item, project, hasSaveNames)
        if (!item.list.length || !fileBufferStringChunk.length) return

        const fileConfig = group?.find(menu => menu.catId == item.list[0].catid)

        if (!isLoadFullApi && !fileConfig) return

        const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
        const saveFileBuffer = configFileFoot(fileBufferStringChunk, noteStringChunk)
        saveFile(savePath, saveFileBuffer)
    })
}
