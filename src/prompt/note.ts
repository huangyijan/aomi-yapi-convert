import { getTypeByValue, hasProperty } from '../utils'
import { getApiName, getUpperCaseName } from '../utils/str-operate'


/** 获取传参名称, TODO，移除params和data,所有的地方都需要额外做处理 */
export const getNoteNameByParamsType = (item: JsDocApiItem, suffix: string) => {
    if (!global.apiConfig.isNeedType) return 'any'
    const requestName = getApiName(item.path, item.method)
    const ParamsName = getUpperCaseName(requestName)
    return ParamsName + getUpperCaseName(suffix)
}


/** 获取放在Promise<xxx>的名字 */
export const getReturnType = (returnName: string | undefined, resType: string | undefined) => {
    if (!returnName || !resType) return 'any'
    if (returnName === 'array') return '[]'
    return returnName
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
export const getApiLinkAddress = (project_id: number, _id: number | string) => {
    const { protocol, host } = global.apiConfig
    const baseUrl = `${protocol}//${host}`
    return `${baseUrl}/project/${project_id}/interface/api/${_id}`
}

/** 获取api最后更新时间 */
export const getUpdateTime = (time: number) => new Date(time * 1000).toLocaleDateString()

/** 获取axios 的额外的请求名称 */
export const getAxiosOptionTypeName = () => {
    const { isNeedAxiosType } = global.apiConfig
    const axiosTypeName = typeof isNeedAxiosType === 'boolean' && isNeedAxiosType ? 'AxiosRequestConfig' : 'any'
    return axiosTypeName
}