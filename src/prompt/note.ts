import { getTypeByValue, hasProperty } from '../utils'
import { getOneApiConfig, getUpperCaseName } from '../utils/str-operate'


/** 获取传参名称 */
export const getNoteNameByParamsType = (item: JsDocApiItem, project: ProjectConfig) => {
    const isGetMethod = item.method.toUpperCase() == 'GET'
    const { requestName } = getOneApiConfig(item.path, project)
    const ParamsName = getUpperCaseName(requestName)
    return ParamsName + (isGetMethod ? 'Params' : 'Data')
}

export const getArrayTypeName = (typeName: string, body: any) => {
    const type = getTypeByValue(body)
    if (type === 'array') { // 处理数组的typeName
        return body.length ? `${typeof body[0]}[]` : 'any[]'
    }
    return typeName
}

/** 获取放在Promise<xxx>的名字 */
export const getReturnType = (returnName: string, resType: string) => {

    if (returnName === 'array') return '[]'
    return resType ? returnName : 'any'
}

/** 获取返回的参数名 */
export const getReturnName = (requestName: string, value: any) => {
    const returnName = requestName + 'Response'
    const type = getTypeByValue(value)
    if (type === 'string' || type === 'array') return type // 如果是字符串或者数组，直接返回类型作为类型名

    return returnName
}

/** 处理一下detailMsg最外层和数组的序列对象 */
export const dealResponseData = (res: any) => {
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


/** 获取文档地址 */
export const getApiLinkAddress = (baseUrl: string, project_id: number, _id: number) => {
    return `${baseUrl}/project/${project_id}/interface/api/${_id}`
}

export const getUpdateTime = (time: number) => new Date(time * 1000).toLocaleDateString()

