import { getApiName, getAppendPath, pathHasParamsRegex } from '../utils/str-operate'
/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem) => {
    const { protocol, host } = global.apiConfig
    const { project_id } = item
    return `/**
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
export const getAppendRequestParamsTs = (path: string, paramsName: string, hasNoteData: boolean) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}: string | number, `)
    requestParams = `(${requestParams}${hasNoteData ? `${paramsName}: any, ` : ''}options: AxiosRequestConfig)`
    return requestParams
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem, hasNoteData: boolean, project: ProjectConfig) => {

    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'
    const requestPath = getAppendPath(item.path, project)
    const requestParams = getAppendRequestParamsTs(item.path, paramsName, hasNoteData)
    const requestName = getApiName(item.path, item.method)
    return `${requestName}: ${requestParams}: Promise<any> => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

export const handleTsFileString = (fileBufferStringChunk: Array<string>, item: apiSimpleItem, project: ProjectConfig) => {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem(item))
    fileBufferStringChunk.push(getMainMethodItem(item, true, project))
}

