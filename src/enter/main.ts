import { CommonFileItem } from '..'
import { handleApiRequestError, request } from './request'
import { getApiToken, getUserId, saveFile } from './file'
import { baseConfig } from '../utils/constants'


/**
 * 注册全局变量，node环境注册global里面的对象，browser环境注册global 到window对象
 * @param config 配置项
 */
const registerGlobal = (config: ApiConfig) => {
    const token = getApiToken()
    const userId = getUserId()
    const targetConfig = Object.assign(baseConfig, config, { token, userId })
    global.apiConfig = targetConfig // node注册全局配置
}

/** 主流程：获取项目配置 => 获取接口json => 生成接口文档 */
export default async function main(config: ApiConfig) {

    registerGlobal(config)
    const { protocol, host, projects } = config
    const baseUrl = `${protocol}//${host}`

    return projects.map(async project => {
        const { projectId } = project
        const projectConfigUrl = `${baseUrl}/api/project/get?id=${projectId}`
        try {
            const projectConfigStr = await request(projectConfigUrl)
            const projectConfig = JSON.parse(projectConfigStr)
            project.projectBaseConfig = projectConfig.data
            
            project.requestUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false` // jsonUrl
            const fileString = await request(project.requestUrl)

            const commonJson = JSON.parse(fileString)
            return generatorFileList(commonJson, project)
        } catch (error) {
            handleApiRequestError(String(error))
        }
    })
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const generatorFileList = async (data: Array<JsDocMenuItem>, project: ProjectConfig) => {
    const hasSaveNames: string[] = [] // 处理已经命名的容器
    const buffers = data.map(async (item: JsDocMenuItem) => {
        if (!item.list.length) return

        const File = new CommonFileItem(project, item, hasSaveNames)
        const saveFileBuffer = File.getFileCode()

        if (!saveFileBuffer) return
        if (!project.isLoadFullApi && !File.fileConfig) return
        await saveFile(File.savePath, saveFileBuffer)
    })

    await Promise.all(buffers)

    return Promise.resolve(new Date())
}
