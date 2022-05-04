const NameRegex = /[-|_]([a-zA-Z])/g // 重命名捕获替换字符串

const quotaRegex = /(,)\s*\n*.*\}/g // 匹配json字符串最后一个逗号
const illegalRegex = /(\/\/\s.*)\n/g // 非法json注释匹配


/** 将下划线和短横线命名的重命名为驼峰命名法 */
export const toHumpName = (str: string) => {
    return str.replace(NameRegex, function (_keb, item) { return item.toUpperCase() })
}


/** hasOwnProperty太长了，写一个代理当简写 */
export const hasProperty = function (obj: object, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

const dealApiObj = (data: any) => {
    if (hasProperty(data, 'properties')) {
        const description = data.description
        data = data.properties

        if (data instanceof Object && hasProperty(data, 'name') && hasProperty(data, 'ordinal')) {
            // 对状态对象处理，yapi 文档自动生成问题，状态字段一般都是呈现出object，实际为string
            data = { type: 'string', description, default: '无', ordinal: true }
        }

    }
    return data
}

/** 数据结构处理后台嵌套的properties层 */
export const removeProperties = (data: any) => {
    
    data = dealApiObj(data)
  
    for (const item in data) {
        const type = getTypeByValue(data[item])
        if (type === 'object') data[item] = removeProperties(data[item])
    }
    return data
}


// 根据数据类型展示数据
export const showExampleStrByType = (value: unknown) => {
    const type = typeof value
    switch (type) {
    case 'object':
        return JSON.stringify(value)
    default:
        return value
    }
}

/** 后台类型转前端类型 */
export const transformType = (serviceType: string) => {
    if (String(serviceType).length > 10) return 'any'
    switch (serviceType) {
    case 'integer':
        return 'number'
    case 'bool':
        return 'boolean'
    default:
        return serviceType
    }
}

/** 判断api数据里面的数据类型 */
export const getTypeByValue = (value: { constructor: ArrayConstructor, type?: string }) => {
    if(value === null) return 'string'
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

/** 处理后台静态类型数据和错误状态的Api */
export const getCorrectType = (value: any) => {
    let type = getTypeByValue(value)

    if (type === 'object') {
        if (hasProperty(value, 'type') && hasProperty(value, 'description')) {
            type = transformType(value.type)
        } else if (hasProperty(value, 'name') && hasProperty(value, 'ordinal')) {
            type = 'string' // 状态字段处理
        } else if (hasProperty(value, 'type') && value.type === 'array') {
            return 'array'
        } else if (hasProperty(value, 'type') && value.type === 'integer') {
            return 'number'
        } else if (hasProperty(value, 'type') && value.type === 'number') {
            return 'number'
        }
    }
    return type
}

/** 获取请求体（body）传输参数 */
export const getLegalJson = (reqBody: string) => {
    if (!reqBody|| reqBody.length<20) return ''
    const isIllegalJsonStr = illegalRegex.test(reqBody) //判断后台返回的字符串是不是合法json字符串
    try {
        if (!isIllegalJsonStr) {
            return JSON.parse(reqBody)
        } else {
            const dealStr = reqBody.replace(illegalRegex, '\n') // 删除注释
            const removeLestQuotaStr = dealStr.replace(quotaRegex, '}') // 删除多余的逗号
            return JSON.parse(removeLestQuotaStr)
        }
    } catch (error) {
        // console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释, TODO
        return '' // 总有一些意外的情况没有考虑到，当字符创处理
    }

}

export const getDescription = (value: any) => {
    let description = ''

    if (hasProperty(value, 'description')) {
        description = value.description || ''
    }
    return description
}