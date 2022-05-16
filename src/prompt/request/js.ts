import {  getLegalJson, removeProperties } from '../../utils'
import { getNoteNameByParamsType } from '../note'

import { getType } from '../../utils/str-operate'
import { getSecondNoteAndName } from '../second'
import { getSuitableJsdocProperty, getSuitableJsdocType, getSuitableType, getSuitDescription } from '../../utils/decision'
 

interface RequestNoteStringItem {
  reqType: string
  typeName: string
}


/** 获取请求参数（params）传输参数，考虑到params一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        paramsStr += getSuitableJsdocProperty(item.name, 'string', item.desc, item.example)
    })

    if (!paramsStr) return ''
    return getSuitableJsdocType(requestName, paramsStr)
}

/** 处理请求体(data)的逻辑规则 */
export const getJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType

    const properties = removeProperties(json)

    if (!Object.keys(properties).length) return '' // 空的对象不做处理，提高性能

    Object.entries(properties).forEach(([key, value]: any) => {

        const description = getSuitDescription(value)
        let type = getSuitableType(value)


        const addTypeName = getType(type, key, requestName) // 这里处理额外的类型
        const { note, name } = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType)
        appendNoteJsdocType = note
        if (name !== type) type = name
        bodyStr += getSuitableJsdocProperty(key, type, description, value.default)
    })

    return getSuitableJsdocType(requestName, bodyStr, appendNoteJsdocType)
}


/** 获取注释的jsDoc类型 */
export const getReqType = (item: JsDocApiItem, typeName: string, hasParamsQuery: boolean) => {
    if (hasParamsQuery) {
        return getConfigNoteParams(item.req_query, typeName)
    } else {
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        return getJsonToJsDocParams(body, typeName)
    }
}


/** 获取请求的参数注释和参数名 */
export const getRequestNoteStringItem = (item: JsDocApiItem, project: ProjectConfig): RequestNoteStringItem => {
  
    const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)

    const typeName = getNoteNameByParamsType(item, project, hasParamsQuery) // 正常object使用的名字

    const reqType = getReqType(item, typeName, hasParamsQuery)

    return {reqType, typeName}
}

