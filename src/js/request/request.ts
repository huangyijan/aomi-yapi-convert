import { getOneApiConfig } from "../../utils/str-operate"
import { removeProperties, configJsdocType, showExampleStrByType, getLegalJson, getDescription, getTypeByValue } from "../../utils"
import { getReturnNoteStringItem, getReturnType } from "../response/response"

interface RequestNoteStringItem {
  reqType: string
  typeName: string
}

/** 处理请求体的逻辑规则 */
export const dealJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {
  let bodyStr = ''
  const properties = removeProperties(json)

  if (!Object.keys(properties).length) return '' // 空的对象不做处理，提高性能

  Object.entries(properties).forEach(([key, value]) => {
    
    const description = getDescription(value)
    const type = configJsdocType(value)
    bodyStr += `* @property {${type}} [${key}]  ${description}   example: ${showExampleStrByType(value.default) || '无'} \n   `
  })

  return (`/** 
   * @typedef ${requestName}
   ${bodyStr}*/\n`)
}



/** 获取请求参数（params）传输参数，考虑到params一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
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
const getNoteNameByParamsType = (item: JsDocApiItem) => {
  const isGetMethod = item.method.toUpperCase() == 'GET'
  const { requestName } = getOneApiConfig(item.path)
  const ParamsName = requestName.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
  return ParamsName + (isGetMethod ? 'Params' : 'Data')
}


/** 获取JSDoc的名称 */
const getTypeName = (item: JsDocApiItem, body: any) => {
  const isGetMethod = item.method.toUpperCase() == 'GET'

  if(!body && !isGetMethod) return '' // 如果没有注释，那就不用命名typeName了

  const type = getTypeByValue(body)
  const typeName = getNoteNameByParamsType(item)


  if (type === 'array') { // 处理数组的typeName
    return body.length ? `${typeof body[0]}[]`: 'any[]'
  }
  return typeName
}

/** 获取注释的jsDoc类型 */
export const getReqType = (item: JsDocApiItem, typeName: string, body: any) => {
  const isGetMethod = item.method.toUpperCase() == 'GET'

  if (typeName.includes('[]')) return ''


  if (isGetMethod) {
    return getConfigNoteParams(item.req_query, typeName)
  } else {
    return dealJsonToJsDocParams(body, typeName)
  }
}

/** 获取请求的参数注释和参数名 */
export const getRequestNoteStringItem = (item: JsDocApiItem): RequestNoteStringItem => {
  
  const body = getLegalJson(item.req_body_other) // 获取合法的json数据
  
  const typeName = getTypeName(item, body)

  const reqType = getReqType(item, typeName, body)
  return {reqType, typeName}
}

