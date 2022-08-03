import { getSuitableDefault, getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote, getTsTypeStr } from '../../utils/decision'


/** 获取请求参数（query）传输参数，考虑到query一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        const example = getSuitableDefault(item) 
        paramsStr += getSuitableTsTypeNote(item.desc , example)
        paramsStr += getSuitableTsType(item.name, 'string')
    })
    if (!paramsStr) return ''
    return getSuitableTsInterface(requestName, paramsStr)
}

/** 处理请求体(data)的逻辑规则 */
export const getConfigNoteData = (data: JsonSchema, interfaceName: string) => {
    if (data?.items) data = data.items
    if (!data || !data.properties || !Object.keys(data).length) return '' // 空的对象不做处理
    const bodyStr = getTsTypeStr(data.properties)
    if (!bodyStr.length) return ''
    return getSuitableTsInterface(interfaceName, bodyStr)
}

