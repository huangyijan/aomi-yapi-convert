import { request } from '../utils/request'
import { readFile, saveFile } from '../utils/file'
import { getMaxTimesObjectKeyName, getPathName } from '../utils'
import { getOneApiConfigJsdoc } from '../utils/str-operate'
import { configFileHeadFoot } from '../simple'
import { getReturnNoteStringItem, getReturnType } from './response/response'
import { getRequestNoteStringItem } from './request/request'
import { getNoteParams, getUpdateTime, getApiLinkAddress, getAppendIdNote } from './note'

/** 配置请求注释 */
export const getNoteStringItem = (item: JsDocApiItem) => {
    const isGetMethod = item.method.toUpperCase() == 'GET'

    const { reqType, typeName } = getRequestNoteStringItem(item)
    const { resType, returnNameWithType } = getReturnNoteStringItem(item)
    const idNote = getAppendIdNote(item.req_params)

    const methodNote = `
  /**
   * 功能描述：${item.title}${idNote}${getNoteParams(reqType, typeName, isGetMethod)} 
   * update_time: ${getUpdateTime(item.up_time)}
   * @link: ${getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id)}
   * @return {Promise<${getReturnType(returnNameWithType, resType)}>}
   */`
    return { methodNote, typeName, reqType, resType }
}


/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, hasNoteData: boolean) => {
    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'

    const { requestName, requestPath, requestParams } = getOneApiConfigJsdoc(item.path, paramsName, hasNoteData)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

const getApiFileConfig = (item: JsDocMenuItem) => {
    const { list } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    const noteStringChunk: Array<string> = ['\n'] // 存储Jsdoc注释的容器
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        
        const { methodNote, reqType, resType } = getNoteStringItem(item)
       

        const hasNoteData = Boolean(reqType)
        const methodStr = getMainMethodItem(item, hasNoteData)

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

/** 处理API文件列表的生成 */
const generatorFileList = (data: Array<JsDocMenuItem>) => {
    const nameChunk = new Map() // TODO 处理重名问题，后面考虑有没有更佳良好取名策略
    data.forEach((item: JsDocMenuItem) => {
        const { FileName, fileBufferStringChunk, noteStringChunk } = getApiFileConfig(item)
        if (!fileBufferStringChunk.length) return

        let FileNameTimes = nameChunk.get(FileName)

        const savePath = `./api/${FileName}${FileNameTimes ? FileNameTimes++ : ''}.js`
        saveFile(savePath, configFileHeadFoot(fileBufferStringChunk, noteStringChunk))

        nameChunk.set(FileName, FileNameTimes ? FileNameTimes : 1)
    })
}


/** 生成带有注释的api-js文件，注释有文档链接，可以直接跳转文档页面 */
export const getApiDocWithJsDoc = async (url: string, token: string) => {
    const fileString = await request(url, token)
    // const fileString = await readFile(url) // 本地文件流测试用
    try {
        const MenuList: Array<JsDocMenuItem> = JSON.parse(fileString)
        generatorFileList(MenuList)
    } catch (error) {
        console.log(error)
    }
}





export const getFullDoc = async (url: string, token: string) => {
    const file = await request(url, token)
    saveFile('./api/fullApi.js', file)

}
// 生成全部api.json文件
// getFullDoc('http://yapi.miguatech.com/api/plugin/export?type=json&pid=445&status=all&isWiki=false')