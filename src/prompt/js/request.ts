import {  removeProperties } from '../../utils'
import { getType } from '../../utils/str-operate'
import { getSecondNoteAndName } from '../../utils/second'
import { getSuitableDefault, getSuitableJsdocProperty, getSuitableJsdocType, getSuitableType, getSuitDescription } from '../../utils/decision'


/** 获取请求参数（params）传输参数，考虑到params一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery | ReqBodyForm>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        const example = getSuitableDefault(item) 
        paramsStr += getSuitableJsdocProperty(item.name, 'string', item.desc, example)
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
        const example = getSuitableDefault(value) 
        bodyStr += getSuitableJsdocProperty(key, type, description, example)
    })

    return getSuitableJsdocType(requestName, bodyStr, appendNoteJsdocType)
}


