import { handleApiRequestError, request } from '../utils/request'
import { getApiToken, saveFile } from '../utils/file'
import { configFileFoot, getApiFileConfig, getSavePath } from '../utils/common'

/** 处理API文件列表的生成 */
const generatorFileList = (data: Array<JsDocMenuItem>, project: ProjectConfig) => {
    const nameChunk = new Map() // 用来处理文件命名的容器, 虽然文件名做了不重名处理，但是还是留下这个做保险
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


/** 生成带有注释的api-js文件，注释有文档链接，可以直接跳转文档页面 */
export const getApiDocWithJsDoc = async (url: string,  project: ProjectConfig) => {
    const token = getApiToken()
    try {
        const fileString = await request(url, token)
        const MenuList: Array<JsDocMenuItem> = JSON.parse(fileString)
        generatorFileList(MenuList,project)
    } catch (error) {
        handleApiRequestError(String(error))
    }
}

