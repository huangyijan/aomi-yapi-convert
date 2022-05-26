import { pathHasParamsRegex } from '../utils/constants'
import { getMainRequestMethodStr, getCustomerParamsStr } from '../utils/str-operate'
/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem) => {
    const { protocol, host } = global.apiConfig
    const { project_id } = item
    return `
 /**
   * @description ${item.title} 
   * @apiUpdateTime ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link ${protocol}//${host}/project/${project_id}/interface/api/${item._id}
   */`
}

/**
 * 处理传Id的API请求参数
 * @param path 请求路径
 * @param paramsName 传输使用的参数名，配合JsDoc文档数据
 * @returns {string} 函数请求使用的参数表达式
 */
export const getAppendRequestParamsTs = (path: string, paramsName: string,project: ProjectConfig) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}: string | number, `)
    requestParams = `(${requestParams}${`${paramsName}: any, `}options: AxiosRequestConfig${getCustomerParamsStr(project)})`
    return requestParams
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem, project: ProjectConfig) => {

    const paramsName = ['GET', 'DELETE'].includes(item.method.toUpperCase()) ? 'params' : 'data' // 按照一般情况处理
    const requestParams = getAppendRequestParamsTs(item.path, paramsName, project)
    const appendParamsStr = `${paramsName}, `
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr, 'any')
}

export const handleTsFileString = (fileBufferStringChunk: Array<string>, item: apiSimpleItem, project: ProjectConfig) => {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem(item))
    fileBufferStringChunk.push(getMainMethodItem(item, project))
}

