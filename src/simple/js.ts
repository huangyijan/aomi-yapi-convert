import { getApiName, getAppendPath, getAppendRequestParamsJsdoc, getAxiosName } from '../utils/str-operate'

/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem) => {
    const { protocol, host } = global.apiConfig
    const {project_id} = item
    return `/**
   * @description ${item.title} 
   * @param {AxiosRequestConfig} options
   * @apiUpdateTime ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link ${protocol}//${host}/project/${project_id}/interface/api/${item._id}
   */`
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem, hasNoteData: boolean, project: ProjectConfig) => {

    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'
    const requestPath = getAppendPath(item.path, project)
    const requestParams = getAppendRequestParamsJsdoc(item.path, paramsName, hasNoteData, project)
    const requestName = getApiName(item.path, item.method)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return ${getAxiosName()}(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

export const handleJsFileString = (fileBufferStringChunk: Array<string>, item: apiSimpleItem, project: ProjectConfig) => {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem(item))
    fileBufferStringChunk.push(getMainMethodItem(item, true, project))
}

