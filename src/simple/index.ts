import { getApiToken, saveFile } from '../utils/file'
import { handleApiRequestError, request } from '../utils/request'
import { configFileHeadFoot, getApiFileConfig, getSavePath } from '../common'


/** 处理API文件列表的生成 */
const generatorFileList = ({ data }: { data: Array<MenuItem> }, project: ProjectConfig) => {
    const config = global.apiConfig
    const nameChunk = new Map() // 用来处理文件命名的容器
    const {group, isLoadFullApi} = project
    const hasSaveNames: string[] = [] // 处理已经命名的容器

    data.forEach((item: MenuItem) => {
        const { FileName, fileBufferStringChunk } = getApiFileConfig(item, project, hasSaveNames)
        if (!fileBufferStringChunk.length) return
        
        const fileConfig = group?.find(menu => menu.catId === item._id)
        if(!isLoadFullApi && !fileConfig) return

        const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
        const saveFileBuffer = configFileHeadFoot(fileBufferStringChunk, [], config) 
        saveFile(savePath, saveFileBuffer)
    })
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const getApiDocWithNoNote = async (url: string, project: ProjectConfig) => {
    const token = getApiToken()
    try {
        const fileString = await request(url, token)
        const MenuList = JSON.parse(fileString)
        generatorFileList(MenuList, project)
    } catch (error) {
        handleApiRequestError(String(error))
    }
}
