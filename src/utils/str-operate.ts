import { getSuitableTsType, getSuitableTsTypeNote } from './decision'
import { request } from './request'

/* eslint-disable no-useless-escape */
const ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g // 獲取接口名稱
const illegalRegex = /[^a-zA-Z0-9]/g // 用来剔除不合法的符号
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
    let baseUrl  =''
    const { prefix, projectBaseConfig } = project
    
    if(projectBaseConfig?.basepath) baseUrl = projectBaseConfig.basepath
    if (prefix) baseUrl = prefix.endsWith('/') ? prefix.slice(0, prefix.length - 1) : prefix // 兼容两种写法
    return baseUrl
}


/** 处理传Id的API请求URL */
export const getAppendPath = (path: string, project: ProjectConfig) => {

    const prefix = getApiBaseUrl(project)
    const isHaveParams = pathHasParamsRegex.test(path) // 地址栏上是否有参数
    if (!isHaveParams) return `'${prefix}${path}'`

    return `\`${prefix}${path.replace(pathHasParamsRegex, (_, p1) => `/$\{${p1}\}`)}\``
}
/** 接口名决策方案：如果有参数先去除参数，然后把接口path剩余数据转成驼峰命名，缺点：接口path如果太长，命名也会比较长 */
export const getApiName = (path: string) => {
    // TODO 首字母不处理驼峰，后面有如果正则方案可以更加优雅的处理
    const dealNamePath = path.startsWith('/') ? path.substring(1) : path 
    const apiName =  dealNamePath.replace(pathHasParamsRegex, '').replace(ApiNameRegex, (_, item) => item.toUpperCase())
    return apiName.replace(illegalRegex, '')
}

/**
 * 获取单个请求的请求名， 请求路径， 请求参数的字符串配置
 * @param path 需要处理的接口地址
 * @returns {Object} {请求名， 请求路径， 请求参数} string
 */
export const getOneApiConfig = (path: string, project: ProjectConfig): requestConfig => {
    const isHaveParams = pathHasParamsRegex.test(path) // 地址栏上是否有参数
    const requestPath = isHaveParams ? getAppendPath(path, project) : `'${path}'`
    const requestParams = isHaveParams ? getAppendRequestParams(path) : '(options)'
    const requestName = getApiName(path)
    return { requestName, requestPath, requestParams }
}


/**
 * 获取单个请求的请求名， 请求路径， 请求参数的字符串配置Jsdoc使用版本
 * @param path 需要处理的接口地址
 * @param paramsName 函数传参名称
 * @returns {Object} {请求名， 请求路径， 请求参数} string
 */
export const getOneApiConfigJsdoc = (path: string, paramsName: string, hasNoteData: boolean, project: ProjectConfig): requestConfig => {
    const requestPath = getAppendPath(path, project)
    const requestParams = getAppendRequestParamsJsdoc(path, paramsName, hasNoteData)
    const requestName = getApiName(path)
    return { requestName, requestPath, requestParams }
}


/**
 * 获取单个请求的请求名， 请求路径， 请求参数的字符串配置Ts使用版本
 * @param path 需要处理的接口地址
 * @param paramsName 函数传参名称
 * @returns {Object} {请求名， 请求路径， 请求参数} string
 */
export const getOneApiConfigTs = (path: string, paramsName: string, hasNoteData: boolean, project: ProjectConfig): requestConfig => {
    const requestPath = getAppendPath(path, project)
    const requestParams = getAppendRequestParamsTs(path, paramsName, hasNoteData)
    const requestName = getApiName(path)
    return { requestName, requestPath, requestParams }
}

/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据，Get请求使用params, Post, Put, Delete 请求使用data
 * @returns {string} 函数请求使用的参数表达式
 */
export const getAppendRequestParamsJsdoc = (path: string, paramsName: string, hasNoteData: boolean) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}, `)
    requestParams = `(${requestParams}${hasNoteData ? `${paramsName}, ` : ''}options)`
    return requestParams
}

/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据，Get请求使用params, Post, Put, Delete 请求使用data
 * @returns {string} 函数请求使用的参数表达式
 */
export const getAppendRequestParamsTs = (path: string, paramsName: string, hasNoteData: boolean) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}: string | number, `)
    requestParams = `(${requestParams}${hasNoteData ? `${paramsName}, ` : ''}options: axiosConfig)`
    return requestParams
}



/** 首字母大写 */
export const getUpperCaseName = (name: string) => {
    return name.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
}

export const getCommandNote = (keyNote: Array<keyNoteItem>, typeName: string) => {
    if(!keyNote.length) return ''

    const version = global.apiConfig.version

    if (version === 'ts') {
        return keyNote.reduce((pre, cur, index) => {
            const { key, type, description = '' } = cur
            const defaultStr = cur.default ? ` default: ${cur.default}` : ''

            pre += getSuitableTsTypeNote(description, defaultStr)
            pre += getSuitableTsType(key, type)
            if (index === keyNote.length - 1) pre += '}\n'
            return pre
        }, `\ninterface ${typeName} {\n`)
    }
    
    if (version === 'js') return keyNote.reduce((pre, cur, index) => {
        const { key, type, description= '' } = cur
        const defaultStr = cur.default ? ` default: ${cur.default}` : ''
        
        pre += `  * @property {${type}} [${key}] ${description} ${defaultStr} \n`
        if (index === keyNote.length - 1) pre += '*/\n'
        return pre
    }, `/** 
  * @typedef ${typeName}\n`)

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