import { request } from '../utils/request'
import { saveFile } from '../utils/file'
import { getMaxTimesObjectKeyName, getPathName, hasProperty } from '../utils'
import { getOneApiConfigJsdoc } from '../utils/str-operate'
import { configFileHeadFoot } from '../simple'
import { getReturnNoteStringItem, getReturnType } from './response/response'
import { getRequestNoteStringItem } from './request/request'
import { getNoteParams, getUpdateTime, getApiLinkAddress, getAppendIdNote } from './note'

/** 配置请求注释 */
export const getNoteStringItem = (item: JsDocApiItem, project: ProjectConfig) => {
    const isGetMethod = item.method.toUpperCase() == 'GET'

    const { reqType, typeName } = getRequestNoteStringItem(item, project)
    const { resType, returnNameWithType } = getReturnNoteStringItem(item, project)
    const idNote = getAppendIdNote(item.req_params)

    const methodNote = `
  /**
   * @description ${item.title}${idNote}${getNoteParams(reqType, typeName, isGetMethod)} 
   * @apiUpdateTime ${getUpdateTime(item.up_time)}
   * @link ${getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id)}
   * @return {Promise<${getReturnType(returnNameWithType, resType)}>}
   */`
    return { methodNote, typeName, reqType, resType }
}


/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, hasNoteData: boolean, project: ProjectConfig) => {
    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'

    const { requestName, requestPath, requestParams } = getOneApiConfigJsdoc(item.path, paramsName, hasNoteData, project)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

const getApiFileConfig = (item: JsDocMenuItem, project: ProjectConfig) => {
    const { list } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    const noteStringChunk: Array<string> = ['\n'] // 存储Jsdoc注释的容器
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        
        const { methodNote, reqType, resType } = getNoteStringItem(item, project)
       

        const hasNoteData = Boolean(reqType)
        const methodStr = getMainMethodItem(item, hasNoteData, project)

        /** 先配置注释再配置请求主方法 */
        fileBufferStringChunk.push(methodNote)
        fileBufferStringChunk.push(methodStr)


        if (reqType) noteStringChunk.push(reqType)
        if (resType) noteStringChunk.push(resType)
        // 统计名字出现次数，用作文件夹命名依据
        const pathName = getPathName(item.path)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
    })
    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 会出现重名问题
    const FileName = getMaxTimesObjectKeyName(pathSet)
    return { FileName, fileBufferStringChunk, noteStringChunk }
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
    
    const path =  `${dir}/${fileName}${FileNameTimes || ''}.js`
    nameChunk.set(fileName, FileNameTimes || 1)
    return path
}

/** 处理API文件列表的生成 */
const generatorFileList = (data: Array<JsDocMenuItem>, project: ProjectConfig, config: ApiConfig) => {
    const nameChunk = new Map() // TODO 处理重名问题，后面考虑有没有更佳良好取名策略
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
export const getApiDocWithJsDoc = async (url: string, config: ApiConfig, project: ProjectConfig) => {
    const fileString = await request(url, config.token)
    try {
        const MenuList: Array<JsDocMenuItem> = JSON.parse(fileString)
        generatorFileList(MenuList,project, config)
    } catch (error) {
        console.log(error)
    }
}

