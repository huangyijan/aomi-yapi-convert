import { getAxiosType } from '../prompt/note'
import { getAppendRequestParamsJsdoc, getMainRequestMethodStr } from '../utils/str-operate'

/** 配置注释 */
const getNoteStringItem = (item: JsDocApiItem) => {
    const { protocol, host } = global.apiConfig
    const {project_id} = item
    return `
 /**
   * @description ${item.title}${getAxiosType()}
   * @apiUpdateTime ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link ${protocol}//${host}/project/${project_id}/interface/api/${item._id}
   */`
}

/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, project: ProjectConfig) => {

    const paramsName = ['GET', 'DELETE'].includes(item.method.toUpperCase()) ? 'params' : 'data' // 按照一般情况处理
    const requestParams = getAppendRequestParamsJsdoc(item.path, paramsName, true, project)
    const appendParamsStr = `${paramsName}, `
    return getMainRequestMethodStr(project, item, requestParams, appendParamsStr)
}

export const handleJsFileString = (fileBufferStringChunk: Array<string>, item: JsDocApiItem, project: ProjectConfig) => {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem(item))
    fileBufferStringChunk.push(getMainMethodItem(item, project))
}

