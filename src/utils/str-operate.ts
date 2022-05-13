import { getSuitableJsdocProperty, getSuitableJsdocType, getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote } from './decision'
/* eslint-disable no-useless-escape */
const ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g // 獲取接口名稱
const illegalRegex = /[^a-zA-Z0-9]/g // 用来剔除不合法的符号
const longBiasRegex = /\/[^\/]*/ // 处理多个“/”地址的情况
export const pathHasParamsRegex = /\/\{([a-zA-Z0-9]*)\}/g // 獲取接口参数名稱

/** 获取合法可以被处理的接口path，有些接口可能不是很常规，这里处理异常情况 */
export const getValidApiPath = (path: string) => {
    if (path.includes('?')) path = path.split('?')[0]
    if (path.endsWith('/')) path = path.slice(0, path.length - 1)
    return path
}

/** 处理传Id的API请求参数 */
export const getAppendRequestParams = (path: string) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}, `)
    requestParams = `(${requestParams}options)`
    return requestParams
}

/** 获取处理地址的baseUrl */
const getApiBaseUrl = (project: ProjectConfig) => {
    let baseUrl = ''
    const { prefix, projectBaseConfig } = project
    if (projectBaseConfig?.basepath) baseUrl = projectBaseConfig.basepath
    if (prefix) baseUrl = prefix.endsWith('/') ? prefix.slice(0, prefix.length - 1) : prefix // 兼容两种写法
    return baseUrl
}




/** 接口名决策方案：如果有参数先去除参数，然后把接口path剩余数据转成驼峰命名，缺点：接口path如果太长，命名也会比较长 */
export const getApiName = (path: string, method: string) => {
    path = path.replace(pathHasParamsRegex, '')
    // 处理名字太长
    const biasCount = --path.split('/').length
    if (biasCount >= 3) path = path.replace(longBiasRegex, '')
    path = path.replace(ApiNameRegex, (_, item) => item.toUpperCase())
    // 防止restful API 导致命名相同
    return method.toLowerCase() + path.replace(illegalRegex, '')
}

/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据
 * @returns {string} 函数请求使用的参数表达式
 */
export const getAppendRequestParamsJsdoc = (path: string, paramsName: string, hasNoteData: boolean, project: ProjectConfig) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}, `)
    requestParams = `(${requestParams}${hasNoteData ? `${paramsName}, ` : ''}options${getCustomerParamsStr(project)})`
    return requestParams
}



/** 首字母大写 */
export const getUpperCaseName = (name: string) => {
    return name.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
}

export const getCommandNote = (keyNote: Array<keyNoteItem>, typeName: string) => {
    if (!keyNote.length) return ''

    const version = global.apiConfig.version
    let noteString = ''

    if (version === 'ts') {
        keyNote.forEach(item => {
            const { key, type, description } = item
            const defaultStr = item.default ? ` default: ${item.default}` : ''
            noteString += getSuitableTsTypeNote(description, defaultStr)
            noteString += getSuitableTsType(key, type)
        })
        return getSuitableTsInterface(typeName, noteString)
    }

    if (version === 'js') {
        keyNote.forEach(item => {
            const { key, type, description } = item
            noteString += getSuitableJsdocProperty(key, type, description, item.default)
        })
        return getSuitableJsdocType(typeName, noteString)
    }

    return ''
}

/** 处理返回的数据类型typeName */
export const getType = (type: string, key: string, typeName: string) => {
    if (type === 'array') {
        return typeName + getUpperCaseName(key) + '[]'
    }
    if (type === 'object') {
        return typeName + getUpperCaseName(key)
    }
    return type
}

/** 根据用户配置自定义参数去获取请求的额外参数, requestParams */
export const getCustomerParamsStr = (project: ProjectConfig, showDefault = true) => {
    const customParams = project.customParams || global.apiConfig.customParams
    if (!customParams || !customParams.length) return ''
    return customParams.reduce((pre, cur, index) => {
        if (!index) pre += ', '
        if (cur.name) pre += `${cur.name}`
        if (showDefault && cur.default) pre += ` = ${/\d+/.test(cur.default + '') ? cur.default : `'${cur.default}'`}`
        if (index !== customParams.length - 1) pre += ', '
        return pre
    }, '')
}


/** 处理传Id的API请求URL */
const getAppendPath = (path: string, project: ProjectConfig) => {
    const prefix = getApiBaseUrl(project)
    const isHaveParams = pathHasParamsRegex.test(path) // 地址栏上是否有参数
    if (!isHaveParams) return `'${prefix}${path}'`
    return `\`${prefix}${path.replace(pathHasParamsRegex, (_, p1) => `/$\{${p1}\}`)}\``
}

/** 获取用户axiosName, 可能会有ssr,或者将axios 挂载在this指针的情况  */
const getAxiosName = () => {
    const { axiosName } = global.apiConfig
    return axiosName || 'fetch'
}

export const getCommonRequestItemStr = (project: ProjectConfig, item: JsDocApiItem | apiSimpleItem, requestParamsStr: string, appendParamsStr = '', returnType?: string) => {
    const requestPath = getAppendPath(item.path, project)
    const requestName = getApiName(item.path, item.method)
    const returnTypeStr = returnType? `: Promise<${returnType}>`: ''
    return  `${requestName}: ${requestParamsStr}${returnTypeStr} => {
    const method = '${item.method}'
    return ${getAxiosName()}(${requestPath}, { ${appendParamsStr}method, ...options }${getCustomerParamsStr(project, false)})
  },`
}