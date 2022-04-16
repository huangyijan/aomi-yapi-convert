import { getType } from '../../../utils/str-operate'
import { removeProperties, getDescription, configJsdocType, showExampleStrByType } from '../../../utils'
import { getSecondNoteAndName } from '../../../utils/second'

/** 处理请求体(data)的逻辑规则 */
export const getJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType

    const properties = removeProperties(json)

    if (!Object.keys(properties).length) return '' // 空的对象不做处理，提高性能

    Object.entries(properties).forEach(([key, value]: any) => {

        const description = getDescription(value)
        let type = configJsdocType(value)


        const addTypeName = getType(type, key, requestName) // 这里处理额外的类型
        const { note, name } = getSecondNoteAndName(value, addTypeName, type, appendNoteJsdocType)
        appendNoteJsdocType = note
        if (name !== type) type = name

        bodyStr += `* @property {${type}} [${key}]  ${description}   example: ${showExampleStrByType(value.default) || '无'} \n   `



    })

    return (`/** 
   * @typedef ${requestName}
   ${bodyStr}*/\n${appendNoteJsdocType}`)
}