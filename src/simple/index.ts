import { getOneApiConfigJsdoc } from '../utils/str-operate'
import { saveFile } from '../utils/file'
import { getMaxTimesObjectKeyName, getPathName, hasProperty } from '../utils'
import { request } from '../utils/request'
import format from '../utils/format'

/** 获取文件头部描述文件 */
const getHeaderInfo = () => {
    return `
/** eslint-disable */
/**
 * @file 该文件由aomi-yapi-convert自动生成，请不要改动这个文件。
 * @docUpdateTime ${new Date().toLocaleDateString()}
 */
    `
}

/** 配置文件头尾 */
export const configFileHeadFoot = (fileBufferStringChunk: Array<string>, noteStringChunk: Array<string>, config: ApiConfig) => {
    const axiosFrom = config.axiosFrom || 'import fetch from \'axios\''
    fileBufferStringChunk.unshift('export default {')
    fileBufferStringChunk.unshift(axiosFrom)
    fileBufferStringChunk.unshift(getHeaderInfo())
    fileBufferStringChunk.push('}')
    fileBufferStringChunk.push(...noteStringChunk)
    return format(fileBufferStringChunk)
}

/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem, project_id: number, config: ApiConfig) => {
    const {protocol, host} = config
    return `/**
   * @description ${item.title} 
   * @apiUpdateTime ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link ${protocol}//${host}/project/${project_id}/interface/api/${item._id}
   */`
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem, hasNoteData: boolean, project: ProjectConfig) => {

    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'
    const { requestName, requestPath, requestParams } = getOneApiConfigJsdoc(item.path, paramsName, hasNoteData, project)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

/**
 * 获取单个API文件的保存文件名和写入的文件流字符串
 * @param item 接口菜单单项
 * @param project 项目组文件的配置
 * @returns {Object} {文件名：string, 单个API文件流主容器: string}
 */
const getApiFileConfig = (item: MenuItem, project: ProjectConfig, config: ApiConfig) => {
    const { list, project_id } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        /** 先配置注释再配置请求主方法 */
        fileBufferStringChunk.push(getNoteStringItem(item, project_id, config))
        fileBufferStringChunk.push(getMainMethodItem(item, false, project))

        // 统计名字出现次数，用作文件夹命名依据
        const pathName = getPathName(item.path)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
    })

    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 会出现重名问题
    const FileName = getMaxTimesObjectKeyName(pathSet)


    return { FileName, fileBufferStringChunk }
}

/** 获取文件存储的路径 */
const getSavePath = (recommendName: string, project: ProjectConfig, fileConfig: CatConfig | undefined, nameChunk: Map<string, number>) => {
    let fileName = recommendName
    let dir = project.outputDir
    // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
    if (fileConfig && hasProperty(fileConfig, 'fileName')) fileName = fileConfig.fileName
    if (fileConfig && hasProperty(fileConfig, 'outputDir')) dir = fileConfig.outputDir

    let FileNameTimes = nameChunk.get(recommendName)
    if (FileNameTimes) FileNameTimes++ // 如果map已经有值那我们就+1，防止用户命名冲突，虽然不太优雅

    const path = `${dir}/${fileName}${FileNameTimes || ''}.js`
    nameChunk.set(fileName, FileNameTimes || 1)
    return path
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

        const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
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
