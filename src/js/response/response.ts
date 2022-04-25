import { getOneApiConfig, getType } from '../../utils/str-operate'
import { removeProperties, hasProperty, configJsdocType, getLegalJson, getDescription, getTypeByValue } from '../../utils'
import { getSecondNoteAndName } from '../../utils/second'

interface ReturnNoteStringItem {
    returnNameWithType: string
    resType: string
}

/** 获取放在Promise<xxx>的名字 */
export const getReturnType = (returnName: string, resType: string) => {

    if (returnName === 'array') return '[]'
    return resType ? returnName : 'any'
}

/** 获取返回的参数名 */
const getReturnName = (requestName: string, value: any) => {
    const returnName = requestName + 'Response'
    const type = getTypeByValue(value)
    if (type === 'string' || type === 'array') return type // 如果是字符串或者数组，直接返回类型作为类型名

    return returnName
}

/** 配置返回注释 */
export const getReturnNoteStringItem = (item: JsDocApiItem, project: ProjectConfig): ReturnNoteStringItem => {

    const body = getLegalJson(item.res_body) // 获取合法的json数据

    if (typeof body !== 'object') return { returnNameWithType: 'string', resType: '' }

    const { requestName } = getOneApiConfig(item.path, project)

    const data = removeProperties(body) // 删除后台传回来的多余嵌套的属性数据

    const { res, isArray } = dealResponseData(data) // 处理一下返回的数据


    const returnName = getReturnName(requestName, res)

    const resType = dealJsonToJsDocReturn(res, returnName)


    const returnNameWithType = isArray ? `${returnName}[]` : returnName

    return { returnNameWithType, resType }
}

/** 专门用来处理一下detailMsg最外层和数组的序列对象 */
const dealResponseData = (res: any) => {
    let isArray = false // 是否为数组对象
    if (hasProperty(res, 'detailMsg')) {
        res = res.detailMsg
        if (hasProperty(res, 'items') && res.type === 'array') { // 数组的结构专门处理
            res = res.items
            isArray = true
        }
    }
    return { res, isArray }
}


/** 处理返回的数据类型处理 */
export const dealJsonToJsDocReturn = (data: object, returnName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType


    if (!Object.keys(data).length) return '' // 空的对象不做处理，提高性能

    if (returnName === 'string' || returnName === 'array') return ''

    Object.entries(data).forEach(([key, value]) => {
        const description = getDescription(value)
        let type = configJsdocType(value)
        const addTypeName = getType(type, key, returnName)

        const {note, name} = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType)
   
        appendNoteJsdocType = note
        if(name !== type) type = name

        bodyStr += `* @property {${type}} [${key}] ${description} \n   `
    })
    
    const resType = `/** 
   * @typedef ${returnName}
   ${bodyStr}*/\n${appendNoteJsdocType}`

    return resType
}