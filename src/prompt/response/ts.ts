import { getApiName } from '../../utils/str-operate'
import {  getLegalJson } from '../../utils'
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
        const type = commonDeal(value)
        bodyStr += getSuitableTsTypeNote(description)
        bodyStr += getSuitableTsType(key, type)
    })
    return bodyStr
}


/** 统一处理json schema 数据结构 */
const commonDeal = (child: JsonSchema) => {
    let childType = getSuitableType(child)
    if (childType === 'object' && child?.properties) {
        childType = `{\n${getTsTypeStr(child.properties)}}`
    }
    if (childType === 'array' && child?.items) {
        childType = `Array<${commonDeal(child.items)}>`
    }
    return childType
}
