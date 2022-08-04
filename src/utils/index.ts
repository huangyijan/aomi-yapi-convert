import { ApiNameRegex, illegalJsonRegex, quotaRegex } from './constants'


/** 将下划线和短横线命名的重命名为驼峰命名法 */
export const toHumpName = (str: string) => {
    return str.replace(ApiNameRegex, function (_keb, item) { return item.toUpperCase() })
}


/** hasOwnProperty太长了，写一个代理当简写 */
export const hasProperty = function (obj: object, key: string) {
    if (!obj) return false
    return Object.prototype.hasOwnProperty.call(obj, key)
}


/** 判断api数据里面的数据类型 */
export const getTypeByValue = (value: any) => {
    if (value === null) return 'string' 
    const jsType = typeof value
    switch (jsType) {
        case 'object': // 引用类型都是object，需要处理不同引用类型
            return value.constructor === Array ? 'array' : 'object'
        case 'undefined': 
            return 'any'
        default:
            return jsType
    }
}


/** 获取请求体（body）传输参数 */
export const getLegalJson = (reqBody: string) => {
    if (!reqBody|| reqBody.length<20) return ''
    const isIllegalJsonStr = illegalJsonRegex.test(reqBody) //判断后台返回的字符串是不是合法json字符串
    try {
        if (!isIllegalJsonStr) {
            return JSON.parse(reqBody)
        } else {
            const dealStr = reqBody.replace(illegalJsonRegex, '\n') // 删除注释
            const removeLestQuotaStr = dealStr.replace(quotaRegex, '}') // 删除多余的逗号
            return JSON.parse(removeLestQuotaStr)
        }
    } catch (error) {
        console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释, TODO
        return '' // 总有一些意外的情况没有考虑到，当字符创处理
    }

}

/** 获取通用请求头 */
export const getHeader = () => {
    const config = global.apiConfig
    const token = config.token
    const userId = config.userId
    const HeaderConfig = {
        Cookie: `_yapi_token=${token}; _yapi_uid=${userId}`,
        Accept: 'application/json, text/plain, */*'
    }
    return HeaderConfig
}