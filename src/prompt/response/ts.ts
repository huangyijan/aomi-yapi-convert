import { getApiName, getType } from '../../utils/str-operate'
import { removeProperties, getLegalJson, hasProperty } from '../../utils'
import { getSecondNoteAndName } from '../second'
import { dealResponseData, getReturnName } from '../note'
import { getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote, getSuitableType, getSuitDescription } from '../../utils/decision'

interface ReturnNoteStringItem {
    returnNameWithType: string
    resType: string
}


/** 配置返回注释 */
export const getReturnNoteStringItem = (item: JsDocApiItem): ReturnNoteStringItem => {
    const body = getLegalJson(item.res_body) // 获取合法的json数据
    if (typeof body !== 'object') return { returnNameWithType: 'string', resType: '' }
    const requestName = getApiName(item.path, item.method)
    const returnName = requestName + 'Response'
    const resType = dealJsonToTsTypeReturn(body, returnName)
    return { returnNameWithType: returnName, resType }
}


/** 处理返回的数据类型处理 */
export const dealJsonToTsTypeReturn = (data: any, returnName: string) => {
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理，提高性能
    const bodyStr = getTsTypeStr(data.properties)
    const resType = getSuitableTsInterface(returnName, bodyStr)
    return resType
}

const getTsTypeStr = (data: object) => {
    let bodyStr = ''
    Object.entries(data).forEach(([key, value]) => {
        const description = getSuitDescription(value)
        let type = getSuitableType(value)
        if (type === 'object' && hasProperty(value, 'properties')) {
            type = `{\n${getTsTypeStr(value.properties)}}\n`
        }
        if (type === 'array' && hasProperty(value, 'items')) {
            type = getArrayDataStr(value)
        }
        bodyStr += getSuitableTsTypeNote(description)
        bodyStr += getSuitableTsType(key, type)
    })
    return bodyStr
}

interface JsonSchema {
    type: 'string' | 'integer' | 'number' | 'object' | 'array' | 'null' | 'boolean'
    properties?: { [key: string]: object }
    items?: JsonSchema
    description?: string
}


const getArrayDataStr = (value: JsonSchema) => {
    const child = value.items
    let childType = getSuitableType(child)
    if (childType === 'object' && child?.properties) {
        childType = `{\n${getTsTypeStr(child.properties)}}`
    }
    if (childType === 'array' && child?.items) {
        childType = getArrayDataStr(child)
    }
    childType = `Array<${childType}>`
    return childType
}