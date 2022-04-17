import { getTypeByValue } from '../../../utils'
import { getOneApiConfig, getUpperCaseName } from '../../../utils/str-operate'


/** 获取传参名称 */
export const getNoteNameByParamsType = (item: JsDocApiItem, project: ProjectConfig) => {
    const isGetMethod = item.method.toUpperCase() == 'GET'
    const { requestName } = getOneApiConfig(item.path, project)
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