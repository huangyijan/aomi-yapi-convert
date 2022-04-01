import { getLegalJson } from "../../utils"
import { getConfigNoteParams } from "./reqType/params"
import { getJsonToJsDocParams } from "./reqType/data"
import { getNoteNameByParamsType, getArrayTypeName } from "./reqType/common"

interface RequestNoteStringItem {
  reqType: string
  typeName: string
}


/** 获取注释的jsDoc类型 */
export const getReqType = (item: JsDocApiItem, typeName: string, body: any) => {
  const isGetMethod = item.method.toUpperCase() == 'GET'

  if (typeName.includes('[]')) return  ''
  if (isGetMethod) {
    return getConfigNoteParams(item.req_query, typeName)
  } else {
    return getJsonToJsDocParams(body, typeName)
  }
}



/** 获取请求的参数注释和参数名 */
export const getRequestNoteStringItem = (item: JsDocApiItem): RequestNoteStringItem => {
  
  const body = getLegalJson(item.req_body_other) // 获取合法的json数据
  
  const normalName = getNoteNameByParamsType(item) // 正常object使用的名字

  const typeName = getArrayTypeName(normalName, body) // 处理数组的情况
  
  const reqType = getReqType(item, typeName, body)
  return {reqType, typeName}
}

