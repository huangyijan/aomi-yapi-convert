
import { getReturnNoteStringItem } from './response/js'
import { getRequestNoteStringItem } from './request/js'
import { getUpdateTime, getApiLinkAddress, getReturnType } from './note'
import { getOneApiConfigJsdoc } from '../utils/str-operate'

/** 配置地址栏上面的id jsdoc 注释 */
const getAppendIdNote = (params: Array<ReqParams>) => {
    return params.reduce((pre, curr) => {
        const { example, desc, name, _id } = curr
        if (_id) pre += `\n   * @param { number | string } ${name} ${desc}  example: ${example} `
        return pre
    }, '')
}

/** 获取请求注释上的param注释字符串 */
const getNoteParams = (reqType: string, typeName: string, isGetMethod: boolean) => {
    if (!typeName.includes('[]') && !reqType) return ''
    return `\n   * @param {${typeName}} ${isGetMethod ? 'params' : 'data'}`
}

/** 配置请求注释 */
const getNoteStringItem = (item: JsDocApiItem, project: ProjectConfig) => {
    const isGetMethod = item.method.toUpperCase() == 'GET'

    const { reqType, typeName } = getRequestNoteStringItem(item, project)
    const { resType, returnNameWithType } = getReturnNoteStringItem(item, project)
    const idNote = getAppendIdNote(item.req_params)

    const methodNote = `
  /**
   * @description ${item.title}${idNote}${getNoteParams(reqType, typeName, isGetMethod)} 
   * @param {axiosConfig} options
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

export const handleJsdocFileString = (fileBufferStringChunk: Array<string>, item: JsDocApiItem, project: ProjectConfig, noteStringChunk: Array<string>) => {
    const { methodNote, reqType, resType } = getNoteStringItem(item, project)


    const hasNoteData = Boolean(reqType)
    const methodStr = getMainMethodItem(item, hasNoteData, project)

    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(methodNote)
    fileBufferStringChunk.push(methodStr)

    if (reqType) noteStringChunk.push(reqType)
    if (resType) noteStringChunk.push(resType)
}
