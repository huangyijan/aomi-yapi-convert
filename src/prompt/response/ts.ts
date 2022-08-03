import { getSuitableTsInterface, getTsTypeStr } from '../../utils/decision'

/** 处理返回的数据类型处理 */
export const dealJsonToTsTypeReturn = (data: JsonSchema, interfaceName: string): string => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理


    const { dataParseName } = global.apiConfig
    if (dataParseName && data?.properties?.[dataParseName]) return dealJsonToTsTypeReturn(data?.properties?.[dataParseName] as JsonSchema, interfaceName)


    const bodyStr = getTsTypeStr(data.properties)
    if (!bodyStr.length) return ''
    return getSuitableTsInterface(interfaceName, bodyStr)
}
