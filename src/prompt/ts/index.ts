import { dealJsonSchemaArr, getSuitableDefault, getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote, getSuitableType, getTsTypeStr } from '../../utils/decision'

/** 如果在解析不出来interface类型的情况下返回any类型容错 */
export const getTypeName = (interfaceName: string, body: JsonSchema, typeString: string) => {
    if (!typeString) return 'any'
    return body?.items ? `Array<${interfaceName}>` : interfaceName
}

/** 处理请求的return response参数 */
export const dealJsonToTsTypeReturn = (data: JsonSchema, interfaceName: string): string => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理

    // 统一封装的外部不做解析，从外部的dataParseName开始解析
    const { dataParseName, isNeedSecondType } = global.apiConfig
    if (dataParseName && data?.properties?.[dataParseName]) return dealJsonToTsTypeReturn(data?.properties?.[dataParseName] as JsonSchema, interfaceName)

    if (isNeedSecondType) {
        const types: Types[] = []
        dealJsonSchemaArr(data.properties, types, interfaceName)
        return types.reduce((pre, cur) => {
            pre += getSuitableTsInterface(cur.typeName, cur.typeString)
            return pre
        }, '')
    } else {
        const bodyStr = getTsTypeStr(data.properties)
        if (!bodyStr.length) return ''
        return getSuitableTsInterface(interfaceName, bodyStr)
    }
}

/** 获取请求参数（query）传输参数，考虑到query一律是传地址栏，所以type默认设置为string(兼容用req_body_form数据类型) */
export const getConfigNoteParams = (reqQuery: Array<reqQuery | ReqBodyForm>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        const example = getSuitableDefault(item)
        paramsStr += getSuitableTsTypeNote(item.desc, example)
        paramsStr += getSuitableTsType(item.name, item?.type ? getSuitableType(item) : 'string')
    })
    if (!paramsStr) return ''
    return getSuitableTsInterface(requestName, paramsStr)
}

/** 处理请求体(data)的逻辑规则 */
export const getConfigNoteData = (data: JsonSchema, interfaceName: string) => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理

    const { isNeedSecondType } = global.apiConfig
    if (isNeedSecondType) {
        const types: Types[] = []
        dealJsonSchemaArr(data.properties, types, interfaceName)
        return types.reduce((pre, cur) => {
            pre += getSuitableTsInterface(cur.typeName, cur.typeString)
            return pre
        }, '')
    } else {
        const bodyStr = getTsTypeStr(data.properties)
        if (!bodyStr.length) return ''
        return getSuitableTsInterface(interfaceName, bodyStr)
    }
}