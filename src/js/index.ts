import { request } from '../utils/request'
import { readFile, saveFile } from '../utils/file'
import { getCorrectType, getLegalJson, getMaxTimesObjectKeyName, getPathName, removeProperties, showExampleStrByType } from '../utils'
import { getOneApiConfig, getOneApiConfigJsdoc } from '../utils/str-operate'
import { configFileHeadFoot } from '../simple'



// 处理请求体的逻辑规则
const dealJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {
    let bodyStr = ''
    const properties = removeProperties(json)
    Object.entries(properties).forEach(([key, value]) => {
        const {  description } = value
        const type = configJsdocType(value)
        bodyStr += `* @property {${type}} [${key}]  ${description}   example: ${showExampleStrByType(value.default) || '无'} \n   `
    })

    if (!bodyStr) return ''
    return (`/** 
   * @typedef ${requestName}
   ${bodyStr}*/\n`)
}


/** 处理子序列jsdoc类型 */
const configJsdocType = (value: any) => {
    const type = getCorrectType(value) 
    if (type === 'object') { // 真的要传object， TODO: 子Object 对象序列
       
    }
    return type
}


/** 处理返回的数据类型处理 */
const dealJsonToJsDocReturn = (body: object, returnName: string) => {
    if (typeof body !== 'object') return ''
    let bodyStr = ''
    let data = removeProperties(body)
    const isDetailMsgOut = Object.prototype.hasOwnProperty.call(data, 'detailMsg')
    if (isDetailMsgOut) data = data.detailMsg
    Object.entries(data).forEach(([key, value]) => {
        const type = configJsdocType(value)
        bodyStr += `* @property {${type}} [${key}]   \n   `
    })

    if (!bodyStr) return ''
    return (`/** 
   * @typedef ${returnName}
   ${bodyStr}*/\n`)
}




/** 获取请求参数（params）传输参数 */
const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        paramsStr += `* @property {string} [${item.name}]   ${item.desc || ''} example: ${item.example || '无'} \n   `
    })
    if (!paramsStr) return ''
    return `/** 
   * @typedef ${requestName}
   ${paramsStr}*/`
}

/** 判断传参名称 */
const getNoteNameByParamsType = (requestName: string, isGetMethod: boolean) => {
    const ParamsName = requestName.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
    return ParamsName + (isGetMethod ? 'Params' : 'Data')
}

/** 配置请求注释 */
const getNoteStringItem = (item: JsDocApiItem, isGetMethod: boolean) => {
    const { resType, returnName } = getReturnNoteStringItem(item)

    const { requestName } = getOneApiConfig(item.path)
    const body = getLegalJson(item.req_body_other) // 获取合法的json数据
    const typeName = getNoteNameByParamsType(requestName, isGetMethod)
    let reqType = ''
    if (isGetMethod) {
        reqType = getConfigNoteParams(item.req_query, typeName)
    } else {
        reqType = dealJsonToJsDocParams(body, typeName)
    }
    const methodNote = `
  /**
   * 功能描述：${item.title}${reqType ? `\n   * @param {${typeName}} ${isGetMethod ? 'params' : 'data'}` : ''} 
   * update_time: ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link: http://yapi.miguatech.com/project/${item.project_id}/interface/api/${item._id}
   * @return {Promise<${resType ? returnName : 'any'}>}
   */`
    return { methodNote, typeName, reqType, resType, hasNoteData: Boolean(reqType) }
}
/** 配置返回注释 */
const getReturnNoteStringItem = (item: JsDocApiItem) => {
    const { requestName } = getOneApiConfig(item.path)
    const body = getLegalJson(item.res_body) // 获取合法的json数据
    const returnName = requestName + 'Response'
    const resType = dealJsonToJsDocReturn(body, returnName)
    return { returnName, resType }
}

/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, isGetMethod: boolean, hasNoteData: boolean) => {
    const paramsName = isGetMethod ? 'params' : 'data'

    const { requestName, requestPath, requestParams } = getOneApiConfigJsdoc(item.path, paramsName, hasNoteData)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

const getApiFileConfig = (item: JsDocMenuItem) => {
    const { list } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    const noteStringChunk: Array<string> = ['\n'] // 存储Jsdoc注释的容器
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
        const { methodNote, reqType, resType, hasNoteData } = getNoteStringItem(item, isGetMethod)
        const methodStr = getMainMethodItem(item, isGetMethod, hasNoteData)
        /** 先配置注释再配置请求主方法 */
        fileBufferStringChunk.push(methodNote)
        fileBufferStringChunk.push(methodStr)


        if (reqType) noteStringChunk.push(reqType)
        if (resType) noteStringChunk.push(resType)
        // 统计名字出现次数，用作文件夹命名依据
        const pathName = getPathName(item.path)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
    })

    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 会出现重名问题
    const FileName = getMaxTimesObjectKeyName(pathSet)
    return { FileName, fileBufferStringChunk, noteStringChunk }
}

/** 处理API文件列表的生成 */
const generatorFileList = (data: Array<JsDocMenuItem>) => {
    const nameChunk = new Map() // TODO 处理重名问题，后面考虑有没有更佳良好取名策略
    data.forEach((item: JsDocMenuItem) => {
        const { FileName, fileBufferStringChunk, noteStringChunk } = getApiFileConfig(item)
        if (!fileBufferStringChunk.length) return

        let FileNameTimes = nameChunk.get(FileName)

        const savePath = `./api/${FileName}${FileNameTimes ? FileNameTimes++ : ''}.js`
        saveFile(savePath, configFileHeadFoot(fileBufferStringChunk, noteStringChunk))

        nameChunk.set(FileName, FileNameTimes ? FileNameTimes : 1)
    })
}


/** 生成带有注释的api-js文件，注释有文档链接，可以直接跳转文档页面 */
export const getApiDocWithJsDoc = async (url: string) => {
    // const fileString = await request(url)
    const fileString = await readFile(url) // 本地文件流测试用
    try {
        const MenuList: Array<JsDocMenuItem> = JSON.parse(fileString)
        generatorFileList(MenuList)
    } catch (error) {
        console.log(error)
    }
}





export const getFullDoc = async (url: string) => {
    const file = await request(url)
    saveFile('./api/fullApi.js', file)

}
// 生成全部api.json文件
// getFullDoc('http://yapi.miguatech.com/api/plugin/export?type=json&pid=445&status=all&isWiki=false')