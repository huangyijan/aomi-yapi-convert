import { request } from '../utils/request'
import { saveFile } from '../utils/file'
import { configFileHeadFoot, getApiFileConfig, getSavePath } from '../common'



/** 处理API文件列表的生成 */
const generatorFileList = (data: Array<JsDocMenuItem>, project: ProjectConfig) => {
    const config = global.apiConfig
    const nameChunk = new Map() // 用来处理文件命名的容器
    const { group, isLoadFullApi } = project
    data.forEach((item: JsDocMenuItem) => {
        const { FileName, fileBufferStringChunk, noteStringChunk } = getApiFileConfig(item, project)
        if (!item.list.length || !fileBufferStringChunk.length) return
        
        const fileConfig = group?.find(menu => menu.catId === item.list[0].catid)
        if (!isLoadFullApi && !fileConfig) return

        const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
        const saveFileBuffer = configFileHeadFoot(fileBufferStringChunk, noteStringChunk, config) 
        saveFile(savePath, saveFileBuffer)

        
    })
}


/** 生成带有注释的api-js文件，注释有文档链接，可以直接跳转文档页面 */
export const getApiDocWithJsDoc = async (url: string,  project: ProjectConfig) => {
    const fileString = await request(url, global.apiConfig.token)
    try {
        const MenuList: Array<JsDocMenuItem> = JSON.parse(fileString)
        generatorFileList(MenuList,project)
    } catch (error) {
        console.log(error)
    }
}

