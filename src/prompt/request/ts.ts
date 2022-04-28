import { getDescription, getLegalJson, removeProperties } from '../../utils'
import { getNoteNameByParamsType } from '../note'

import { getType } from '../../utils/str-operate'
import { getSecondNoteAndName } from '../second'
import { getSuitableDefault, getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote, getSuitableType } from '../../utils/decision'



interface RequestNoteStringItem {
  reqType: string
  typeName: string
}


/** 获取请求参数（query）传输参数，考虑到query一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        paramsStr += getSuitableTsTypeNote(item.desc , item.example)
        paramsStr += getSuitableTsType(item.name, 'string')
    })
    if (!paramsStr) return ''
    return getSuitableTsInterface(requestName, paramsStr)
}

/** 处理请求体(data)的逻辑规则 */
export const getJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType

    const properties = removeProperties(json)

    if (!Object.keys(properties).length) return '' // 空的对象不做处理，提高性能

    Object.entries(properties).forEach(([key, value]: any) => {

        const description = getDescription(value)
        let type = getSuitableType(value)


        const addTypeName = getType(type, key, requestName) // 这里处理额外的类型
        const { note, name } = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType)
        appendNoteJsdocType = note
        if (name !== type) type = name
        
        const example = getSuitableDefault(value) 
        bodyStr += getSuitableTsTypeNote(description, example)
        bodyStr += getSuitableTsType(key, type)
    })

    return getSuitableTsInterface(requestName, bodyStr, appendNoteJsdocType)
}


/** 获取注释的jsDoc类型 */
export const getReqType = (item: JsDocApiItem, typeName: string) => {
    const hasParamsQuery = Array.isArray(item.req_query) && item.req_query.length
    if (item.path === '/api/holiday') {
        // debugger
    }
    if (hasParamsQuery) {
        return getConfigNoteParams(item.req_query, typeName)
    } else {
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        return getJsonToJsDocParams(body, typeName)
    }
}



/** 获取请求的参数注释和参数名 */
export const getRequestNoteStringItem = (item: JsDocApiItem, project: ProjectConfig): RequestNoteStringItem => {
    const typeName = getNoteNameByParamsType(item, project) // 正常object使用的名字
    const reqType = getReqType(item, typeName)

    return {reqType, typeName}
}

