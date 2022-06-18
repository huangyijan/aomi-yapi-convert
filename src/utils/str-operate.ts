import { OutputStyle } from '..'
import { ApiNameRegex, illegalRegex, longBiasRegex, pathHasParamsRegex } from './constants'
import { getSuitableDefault, getSuitableJsdocProperty, getSuitableJsdocType, getSuitableTsInterface, getSuitableTsType, getSuitableTsTypeNote } from './decision'


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
            const example = getSuitableDefault(item)
            noteString += getSuitableTsTypeNote(description, example)
            noteString += getSuitableTsType(key, type)
        })
        return getSuitableTsInterface(typeName, noteString)
    }

    if (version === 'js') {
        keyNote.forEach(item => {
            const { key, type, description } = item
            const example = getSuitableDefault(item)
            noteString += getSuitableJsdocProperty(key, type, description, example)
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
    // eslint-disable-next-line no-useless-escape
    return `\`${prefix}${path.replace(pathHasParamsRegex, (_, p1) => `/$\{${p1}\}`)}\``
}

/** 获取用户axiosName, 可能会有ssr,或者将axios 挂载在this指针的情况  */
const getAxiosName = () => {
    const { axiosName } = global.apiConfig
    return axiosName || 'fetch'
}

/**
 * 根据导出类型获取单个请求的method字符串
 * @param project 项目配置
 * @param item 请求配置
 * @param requestParamsStr 请求参数字符串
 * @param appendParamsStr method使用的额外的参数字符串
 * @param returnType 服务端返回的类型或类型名
 * @returns string 主方法字符串
 */
export const getMainRequestMethodStr = (project: ProjectConfig, item: JsDocApiItem, requestParamsStr: string, appendParamsStr = '', returnType?: string) => {
    const requestPath = getAppendPath(item.path, project)
    const requestName = getApiName(item.path, item.method)
    const returnTypeStr = global.apiConfig.isNeedType && returnType ? `: Promise<${returnType}>` : ''

    const { outputStyle = OutputStyle.Default } = global.apiConfig

    const requestContent = `{
      const method = '${item.method}'
      return ${getAxiosName()}(${requestPath}, { ${appendParamsStr}method, ...options }${getCustomerParamsStr(project, false)})
   }`

    switch (outputStyle) {
        case OutputStyle.Name:
            return `   export function ${requestName}${requestParamsStr}${returnTypeStr} ${requestContent}`
        case OutputStyle.Anonymous:
            return `   export const ${requestName} = ${requestParamsStr}${returnTypeStr} => ${requestContent}`
        default:
            return ` ${requestName}: ${requestParamsStr}${returnTypeStr} => ${requestContent},`
    }
}