import { request } from '../utils/request'
import { readFile, saveFile } from '../utils/file'
import { getMaxTimesObjectKeyName, getPathName } from '../utils'
import { getOneApiConfig, getOneApiConfigJsdoc } from '../utils/str-operate'
import { configFileHeadFoot } from '../simple'

const quotaRegex = /(,)\s*\n*.*\}/g // 匹配json字符串最后一个逗号
const illegalRegex = /(\/\/\s.*)\n/g // 非法json注释匹配

// 根据数据类型展示数据
const showExampleStrByType = (value: unknown) => {
    const type = typeof value
    switch (type) {
    case 'object':
        return JSON.stringify(value)
    default:
        return value
    }
}
interface Properties {
    [key: string]: {
        type: string
        default: string
        description: string
    }
}
/** 后台类型转前端类型 */
const transformType = (serviceType: string) => {
    switch (serviceType) {
    case 'integer':
        return 'number'
    case 'bool':
        return 'boolean'
    default:
        return serviceType
    }
}

const dealJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {
    let bodyStr = ''
    const isNormalSerialize = Object.prototype.hasOwnProperty.call(json, 'properties')
    if (isNormalSerialize) {
        const properties = json.properties
        Object.entries(properties).forEach(([key, value]) => {
            const { type, description } = value
            bodyStr += `* @property {${transformType(type)}} [${key}]  ${description}   default: ${showExampleStrByType(value.default) || '无'} \n   `
        })
    } else {
        Object.entries(json).forEach(([key, value]) => {
            bodyStr += `* @property {${typeof value}} [${key}]    example: ${showExampleStrByType(value) || '无'} \n   ` // TODO 暂时先序列一层
        })
    }

    if (!bodyStr) return ''
    return (`/** 
   * @typedef ${requestName}
   ${bodyStr}*/\n`)
}


/** 获取请求体（body）传输参数 */
const getConfigNoteBody = (reqBody: string) => {
    if (!reqBody) return ''
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
        console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释
    }

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

const getNoteNameByParamsType = (requestName: string, isGetMethod: boolean) => {
    const ParamsName = requestName.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
    return ParamsName + (isGetMethod? 'Params': 'Data')
}

/** 配置注释 */
const getNoteStringItem = (item: JsDocApiItem, isGetMethod: boolean) => {
    const { requestName } = getOneApiConfig(item.path)
    const body = getConfigNoteBody(item.req_body_other) // 获取合法的json数据
    const typeName = getNoteNameByParamsType(requestName, isGetMethod)
    let reqType = ''
    if (isGetMethod) {
        reqType = getConfigNoteParams(item.req_query, typeName)
    } else {
        reqType = dealJsonToJsDocParams(body, typeName)
    }
    const methodNote =  `
  /**
   * ${item.title}${reqType ? `\n   * @param {${typeName}} ${isGetMethod? 'params': 'data'}` : ''} 
   * 更新时间: ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link: http://yapi.miguatech.com/project/${item.project_id}/interface/api/${item._id}
   */`
    return { methodNote, typeName, reqType}
}

/** 配置请求主方法 */
const getMainMethodItem = (item: JsDocApiItem, isGetMethod: boolean) => {
    const paramsName = isGetMethod ? 'params' : 'data'

    const { requestName, requestPath, requestParams } = getOneApiConfigJsdoc(item.path, paramsName)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ...${paramsName}, method })
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
        const { methodNote, reqType } = getNoteStringItem(item, isGetMethod)
        const methodStr = getMainMethodItem(item, isGetMethod)
        /** 先配置注释再配置请求主方法 */
        fileBufferStringChunk.push(methodNote)
        fileBufferStringChunk.push(methodStr)


        if (reqType) noteStringChunk.push(reqType)
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