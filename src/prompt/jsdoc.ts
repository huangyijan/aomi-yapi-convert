
import { getReturnNoteStringItem } from './response/js'
import { getRequestNoteStringItem } from './request/js'
import { getUpdateTime, getApiLinkAddress, getReturnType } from './note'
import { getApiName, getAppendPath, getAppendRequestParamsJsdoc } from '../utils/str-operate'

/** 配置地址栏上面的id jsdoc 注释 */
const getAppendIdNote = (params: Array<ReqParams>) => {
    return params.reduce((pre, curr) => {
        const { example, desc, name, _id } = curr
        if (_id) pre += `\n   * @param { number | string } ${name} ${desc}  example: ${example} `
        return pre
    }, '')
}



/** 获取请求注释上的param注释字符串 */
const getNoteParams = (reqType: string, typeName: string, hasParamsQuery: boolean) => {
    if (!typeName.includes('[]') && !reqType) return ''
    return `\n   * @param {${typeName}} ${hasParamsQuery ? 'params' : 'data'}`
}

/** 配置请求注释 */
const getNoteStringItem = (item: JsDocApiItem, project: ProjectConfig) => {
    const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)

    const { reqType, typeName } = getRequestNoteStringItem(item, project)
    const { resType, returnNameWithType } = getReturnNoteStringItem(item, project)
    const idNote = getAppendIdNote(item.req_params)

    const methodNote = `
  /**
   * @description ${item.title}${idNote}${getNoteParams(reqType, typeName, hasParamsQuery)} 
   * @param {axiosConfig} options
   * @apiUpdateTime ${getUpdateTime(item.up_time)}
   * @link ${getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id)}
   * @return {Promise<${getReturnType(returnNameWithType, resType)}>}
   */`
    return { methodNote, typeName, reqType, resType }
}


/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, hasNoteData: boolean, project: ProjectConfig) => {
    const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
    const paramsName = hasParamsQuery ? 'params' : 'data'

    const requestPath = getAppendPath(item.path, project)
    const requestParams = getAppendRequestParamsJsdoc(item.path, paramsName, hasNoteData)
    const requestName = getApiName(item.path, item.method)
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
