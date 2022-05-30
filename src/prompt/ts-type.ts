
import { getReturnNoteStringItem } from './response/ts'
import { getRequestNoteStringItem } from './request/ts'
import { getUpdateTime, getApiLinkAddress, getReturnType, getAxiosOptionTypeName } from './note'
import {  getMainRequestMethodStr, getCustomerParamsStr } from '../utils/str-operate'
import { pathHasParamsRegex } from '../utils/constants'

/** 获取请求上参数ts 类型名称 */
const getParamsTypeName = (reqType: string, typeName: string) => {
    if (!typeName.includes('[]') && !reqType) return 'any'
    else return typeName
}

/** 配置请求注释 */
const getNoteStringItem = (item: JsDocApiItem) => {
    return  `
  /**
   * @description ${item.title}
   * @apiUpdateTime ${getUpdateTime(item.up_time)}
   * @link ${getApiLinkAddress('http://yapi.miguatech.com', item.project_id, item._id)}
   */`
}


/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据，Get请求使用params, Post, Put, Delete 请求使用data
 * @returns {string} 函数请求使用的参数表达式
 */
const getAppendRequestParamsTsType = (path: string, paramsName: string, hasNoteData: boolean, requestParamsType: string, project: ProjectConfig) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}: string | number, `)
    requestParams = `(${requestParams}${hasNoteData ? `${paramsName}?: ${requestParamsType}, ` : ''}options?: ${getAxiosOptionTypeName()}${getCustomerParamsStr(project)
    })`
    return requestParams
}

/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, hasNoteData: boolean, project: ProjectConfig, requestParamsType: string, returnParamsType: string) => {
    const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
    const paramsName = hasParamsQuery ? 'params' : 'data'
    const requestParams = getAppendRequestParamsTsType(item.path, paramsName, hasNoteData, requestParamsType, project)
    const appendParamsStr = hasNoteData ? `${paramsName}, ` : ''
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr, returnParamsType)
}
 
export const handleTsTypeFileString = (fileBufferStringChunk: Array<string>, item: JsDocApiItem, project: ProjectConfig, noteStringChunk: Array<string>) => {
    const { reqType, typeName } = getRequestNoteStringItem(item, project)
    const { resType , returnNameWithType} = getReturnNoteStringItem(item)
    const methodNote = getNoteStringItem(item)
    
    const requestParamsType = getParamsTypeName(reqType, typeName)
    const returnParamsType = getReturnType(returnNameWithType, resType)

    const hasNoteData = Boolean(reqType)
    const methodStr = getMainMethodItem(item, hasNoteData, project, requestParamsType, returnParamsType)

    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(methodNote)
    fileBufferStringChunk.push(methodStr)

    if (reqType) noteStringChunk.push(reqType)
    if (resType) noteStringChunk.push(resType)
}
