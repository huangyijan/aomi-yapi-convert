import { dealJsonSchemaArr, getSuitableDefault, getSuitableJsdocProperty, getSuitableJsdocType } from '../../utils/decision'


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
export const getJsonToJsDocParams = (data: JsonSchema, interfaceName: string) => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理

    const types: Types[] = []
    dealJsonSchemaArr(data.properties, types, interfaceName)
    return types.reduce((pre, cur) => {
        pre += getSuitableJsdocType(cur.typeName, cur.typeString)
        return pre
    }, '')
}


/** 处理返回的数据类型处理 */
export const dealJsonToJsDocReturn = (data: JsonSchema, interfaceName: string): string => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理

    // 统一封装的外部不做解析，从外部的dataParseName开始解析
    const { dataParseName } = global.apiConfig
    if (dataParseName && data?.properties?.[dataParseName]) return dealJsonToJsDocReturn(data?.properties?.[dataParseName] as JsonSchema, interfaceName)

    const types: Types[] = []
    dealJsonSchemaArr(data.properties, types, interfaceName)
    return types.reduce((pre, cur) => {
        pre += getSuitableJsdocType(cur.typeName, cur.typeString)
        return pre
    }, '')
}