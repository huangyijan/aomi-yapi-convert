import { saveFile } from '../utils/file'
import { request } from '../utils/request'
import { configFileHeadFoot, getSavePath } from '../common'
import { handleJsFileString } from './js'
import { handleTsFileString } from './ts'
import { getMaxTimesObjectKeyName, getPathName } from '../utils'
import { getValidApiPath } from '../utils/str-operate'

/**
 * 获取Js文件的单个API文件的保存文件名和写入的文件流字符串
 * @param item 接口菜单单项
 * @param project 项目组文件的配置
 * @returns {Object} {文件名：string, 单个API文件流主容器: string}
 */
export const getApiFileConfig = (item: MenuItem, project: ProjectConfig, config: ApiConfig) => {
    const { list } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    const configFunctionName = config.version === 'ts' ? handleTsFileString : handleJsFileString
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        item.path = getValidApiPath(item.path) // 处理一些后台在地址栏上加参数的问题,难搞

        configFunctionName(fileBufferStringChunk, item, project, config)

        // 统计名字出现次数，用作文件夹命名依据
        const pathName = getPathName(item.path)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
    })

    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 会出现重名问题
    const FileName = getMaxTimesObjectKeyName(pathSet)


    return { FileName, fileBufferStringChunk }
}



/** 处理API文件列表的生成 */
const generatorFileList = ({ data }: { data: Array<MenuItem> }, project: ProjectConfig, config: ApiConfig) => {
    const nameChunk = new Map() // TODO 处理重名问题，后面考虑有没有更佳良好取名策略
    const {group, isLoadFullApi} = project
    
    data.forEach((item: MenuItem) => {
        const { FileName, fileBufferStringChunk } = getApiFileConfig(item, project, config)
        if (!fileBufferStringChunk.length) return
        
        const fileConfig = group?.find(menu => menu.catId === item._id)
        if(!isLoadFullApi && !fileConfig) return

        const savePath = getSavePath(FileName, project, fileConfig, nameChunk, config)
        const saveFileBuffer = configFileHeadFoot(fileBufferStringChunk, [], config) 
        saveFile(savePath, saveFileBuffer)
        
    })
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const getApiDocWithNoNote = async (url: string, config: ApiConfig, project: ProjectConfig) => {
    try {
        const fileString = await request(url, config.token)
        const MenuList = JSON.parse(fileString)
        generatorFileList(MenuList, project, config)
    } catch (error) {
        console.log(error)
    }
}
