import { getOneApiConfig } from "../utils/str-operate"
import { removeProperties, hasProperty, configJsdocType, getLegalJson, getDescription, getTypeByValue } from "../utils"

interface ReturnNoteStringItem {
    returnName: string
    resType: string
}

/** 获取放在Promise<xxx>的名字 */
export const getReturnType = (returnName: string, resType: string) => {
    if (returnName === 'string') return returnName
    if (returnName === 'array') return 'string[]'
    return resType ? returnName : '*'
}

/** 获取返回的参数名 */
const getReturnName = (requestName: string, isArray: boolean, value: any) => {
    let returnName = requestName + 'Response'

    const type = getTypeByValue(value)
    if (type === 'string' || type === 'array') return type // 如果是字符串或者数组，直接返回类型作为类型名

    if (isArray) returnName += '[]'

    return returnName

}

/** 配置返回注释 */
export const getReturnNoteStringItem = (item: JsDocApiItem): ReturnNoteStringItem => {

    const body = getLegalJson(item.res_body) // 获取合法的json数据

    if (typeof body !== 'object') return { returnName: 'string', resType: '' }

    const data = removeProperties(body) // 删除后台传回来的多余嵌套的属性数据
    
    const { res, isArray } = dealResponseData(data) // 处理一下返回的数据
    

    const { requestName } = getOneApiConfig(item.path)
    const returnName = getReturnName(requestName, isArray, res)

    const resType = dealJsonToJsDocReturn(res, returnName) 

    
    
    return { returnName, resType }
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
    return {res, isArray}
}

/** 处理返回的数据类型处理 */
export const dealJsonToJsDocReturn = (data: object, returnName: string) => {
    
    let bodyStr = ''


    if (!Object.keys(data).length) return '' // 空的对象不做处理，提高性能

    if (returnName === 'string' || returnName === 'array') return '' 

    Object.entries(data).forEach(([key, value]) => {

        const description = getDescription(value)
        const type = configJsdocType(value)
        bodyStr += `* @property {${type}} [${key}] ${description} \n   `
    })

    const resType = `/** 
   * @typedef ${returnName}
   ${bodyStr}*/\n`

    return resType
}