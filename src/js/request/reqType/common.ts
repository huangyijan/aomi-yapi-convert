import { getTypeByValue } from '../../../utils'
import { getOneApiConfig } from '../../../utils/str-operate'

/** 首字母大写 */
export const getUpperCaseName = (name: string) => {
  return name.replace(/^([a-zA-Z])/, (_, item: string) => item.toUpperCase())
}

/** 获取传参名称 */
export const getNoteNameByParamsType = (item: JsDocApiItem) => {
  const isGetMethod = item.method.toUpperCase() == 'GET'
  const { requestName } = getOneApiConfig(item.path)
  const ParamsName = getUpperCaseName(requestName)
  return ParamsName + (isGetMethod ? 'Params' : 'Data')
}

export const getArrayTypeName = (typeName: string, body: any) => {
  const type = getTypeByValue(body)
  if (type === 'array') { // 处理数组的typeName
    return body.length ? `${typeof body[0]}[]` : 'any[]'
  }
  return typeName
}