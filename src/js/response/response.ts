import { getOneApiConfig, getUpperCaseName } from "../../utils/str-operate"
import { removeProperties, hasProperty, configJsdocType, getLegalJson, getDescription, getTypeByValue, transformType } from "../../utils"

interface ReturnNoteStringItem {
    returnNameWithType: string
    resType: string
}

/** 获取放在Promise<xxx>的名字 */
export const getReturnType = (returnName: string, resType: string) => {

    if (returnName === 'array') return '[]'
    return resType ? returnName : 'any'
}

/** 获取返回的参数名 */
const getReturnName = (requestName: string, value: any) => {
    let returnName = requestName + 'Response'

    const type = getTypeByValue(value)
    if (type === 'string' || type === 'array') return type // 如果是字符串或者数组，直接返回类型作为类型名

    return returnName
}

/** 配置返回注释 */
export const getReturnNoteStringItem = (item: JsDocApiItem): ReturnNoteStringItem => {

    const body = getLegalJson(item.res_body) // 获取合法的json数据

    if (typeof body !== 'object') return { returnNameWithType: 'string', resType: '' }

    const { requestName } = getOneApiConfig(item.path)

    const data = removeProperties(body) // 删除后台传回来的多余嵌套的属性数据

    const { res, isArray } = dealResponseData(data) // 处理一下返回的数据


    const returnName = getReturnName(requestName, res)

    const resType = dealJsonToJsDocReturn(res, returnName)


    const returnNameWithType = isArray ? `${returnName}[]` : returnName

    return { returnNameWithType, resType }
}

/** 专门用来处理一下detailMsg最外层和数组的序列对象 */
const dealResponseData = (res: any) => {
    let isArray = false // 是否为数组对象
    if (hasProperty(res, 'detailMsg')) {
        res = res.detailMsg
        if (hasProperty(res, 'items') && res.type === 'array') { // 数组的结构专门处理
            res = res.items
            isArray = true
        }
    }
    return { res, isArray }
}


interface keyNoteItem {
    key: string
    type: string
    description: string
    default?: string
}


const getCommandNote = (keyNote: Array<keyNoteItem>, typeName: string) => {
    return keyNote.reduce((pre, cur, index) => {
        const { key, type, description } = cur
        const defaultStr = cur.default ? ` default: ${cur.default}` : ''

        pre += `  * @property {${type}} [${key}] ${description} ${defaultStr} \n`
        if (index === keyNote.length - 1) pre += `*/\n`

        return pre
    }, `/** 
  * @typedef ${typeName}\n`)
}


/** 获取不正常序列化的数组对象注释 */
const getUnNormalObjectNote = (arrayValue: Array<any>, typeName: string) => {
    const arrayItem = arrayValue[0]
    const keyNote = Object.keys(arrayItem)

    const commonArr = keyNote.map(key => {
        const type = getTypeByValue(arrayItem[key])
        const description = String(arrayItem[key])

        return {
            key, type, description, default: ''
        }
    })
    return getCommandNote(commonArr, typeName)
}

/** 正常的数组对象注释 */
const getNormalObjectNote = (data: { [key: string]: any }, typeName: string) => {
    const keyNote = Object.keys(data)
    const commonArr: Array<keyNoteItem> = []
    keyNote.reduce((pre, key) => {
        const value = data[key]
        if (!value || typeof value !== 'object') return pre
        const description = value.description
        const type = transformType(value.type)
        const defaultStr = value.default
        pre.push({ key, description, type, default: defaultStr })
        return pre
    }, commonArr)
    return getCommandNote(commonArr, typeName)

}
const getObjectTypeNote = (objectValue: { [key: string]: any }, addTypeName: string) => {
    if (hasProperty(objectValue, 'mock')) return ''
    const keys = Object.keys(objectValue)
    const commonArr = keys.map(key => {
        const { type, description } = objectValue[key]
        const defaultStr = objectValue[key].default
        return { key, type, description, default: defaultStr }
    })
    return getCommandNote(commonArr, addTypeName)
}

/**
 * 获取数据结构里面的数组对象，这里面有三种情况需要处理
 * 1、第一种是最外层是item的object对象，但是实际api是要传数组的
 * 2、string或者number的array对象
 * 3、没有正常序列的数组对象，object。这样的数据没有正常description字段
 * @param arrayValue 需要处理的数组对象
 * @param addTypeName 注释类型名称
 * @returns {string}
 */
const getArrayTypeNote = (arrayValue: any, addTypeName: string) => {
    if (!arrayValue.length && hasProperty(arrayValue, 'items')) { //  1、这里处理外部有一层Item
        const data = arrayValue.items
        if(hasProperty(data, 'type') && data.type === 'string') return 'string'
        if (hasProperty(data, 'ordinal') && typeof data.ordinal === 'boolean') return 'string' // 后台状态字符创标志符
        const note = getNormalObjectNote(data, addTypeName)
        return note
    }

    const type = typeof arrayValue[0]
    if (type !== 'object') return type // 2、第二种情况处理

    const note = getUnNormalObjectNote(arrayValue, addTypeName) // 3、第三种情况处理
    return note
}



/** 处理返回的数据类型typeName */
const getType = (type: string, key: string, returnName: string) => {
    if (type === 'array') {
        return returnName + getUpperCaseName(key) + '[]'
    }
    if (type === 'object') {
        return returnName + getUpperCaseName(key)
    }
    return type
}

/** 处理返回的数据类型处理 */
export const dealJsonToJsDocReturn = (data: object, returnName: string) => {

    let bodyStr = ''
    let appendNoteJsdocType = '' // 额外的JsDocType


    if (!Object.keys(data).length) return '' // 空的对象不做处理，提高性能

    if (returnName === 'string' || returnName === 'array') return ''

    Object.entries(data).forEach(([key, value]) => {
        const description = getDescription(value)
        let type = configJsdocType(value)
        const addTypeName = getType(type, key, returnName)
        
        if (type.includes('array')) {
            const typeName = addTypeName.substring(0, addTypeName.length - 2)
            if (returnName === 'innerOrderLuckBagUserListResponse') {
                console.log(JSON.stringify(data));
            }
            const addNote = getArrayTypeNote(value, typeName)
            
            if (addNote === 'string') type = 'string[]' // 处理字符串数组和特殊的api自动生成错误
            if (addNote.includes('@typedef')) { // 有正常序列的Jsdoc
                type = addTypeName
                if ('string, boolean, number'.includes(addNote)) type = `${addNote}[]`
                appendNoteJsdocType += addNote
            }

        }


        if (type.includes('object')) {
            const addNote = getObjectTypeNote(value, addTypeName)
            if (addNote) {
                appendNoteJsdocType = addNote
                type = addTypeName
            }
        }

        bodyStr += `* @property {${type}} [${key}] ${description} \n   `
    })
    
    const resType = `/** 
   * @typedef ${returnName}
   ${bodyStr}*/\n${appendNoteJsdocType}`

    return resType
}