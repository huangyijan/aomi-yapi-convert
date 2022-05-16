import { getApiName, getType } from '../../utils/str-operate'
import { removeProperties, getLegalJson } from '../../utils'
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

    const data = removeProperties(body) // 删除后台传回来的多余嵌套的属性数据

    const { res, isArray } = dealResponseData(data) // 处理一下返回的数据


    const returnName = getReturnName(requestName, res)

    const resType = dealJsonToTsTypeReturn(res, returnName)


    const returnNameWithType = isArray ? `${returnName}[]` : returnName

    return { returnNameWithType, resType }
}

/** chu */

/** 处理返回的数据类型处理 */
export const dealJsonToTsTypeReturn = (data: object, returnName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType


    if (!Object.keys(data).length) return '' // 空的对象不做处理，提高性能

    if (returnName === 'string' || returnName === 'array') return ''


    Object.entries(data).forEach(([key, value]) => {
        const description = getSuitDescription(value)
        let type = getSuitableType(value)
        const addTypeName = getType(type, key, returnName)

        const {note, name} = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType)
        
        if(note) appendNoteJsdocType = note
        if (name !== type) type = name
        
        bodyStr += getSuitableTsTypeNote(description)
        bodyStr += getSuitableTsType(key, type)
    })

    const resType = getSuitableTsInterface(returnName, bodyStr, appendNoteJsdocType)

    return resType
}