import { getSuitableType, getSuitableDefault } from '../utils/decision'
import { hasProperty } from '../utils'
import { getCommandNote } from '../utils/str-operate'


/** 获取不正常序列化的数组对象注释 */
export const getUnNormalObjectNote = (arrayValue: Array<any>, typeName: string) => {

    const arrayItem = arrayValue[0]
    const keyNote = Object.keys(arrayItem)

    const commonArr = keyNote.map(key => {
        const type = getSuitableType(arrayItem[key])
        const description = String(arrayItem[key]) // 暂时只是序列了两层，超过了三层的没有处理,
        return {
            key, type, description, default: ''
        }
    })
    return getCommandNote(commonArr, typeName)
}

/** 正常的数组对象注释 */
export const getNormalObjectNote = (data: { [key: string]: any }, typeName: string) => {
    const keyNote = Object.keys(data)
    const commonArr: Array<keyNoteItem> = []

    keyNote.reduce((pre, key) => {
        const value = data[key]
        if (!value || typeof value !== 'object') return pre
        const description = value.description || ''
        const type = getSuitableType(value)
        const defaultStr = value.default || ''
        pre.push({ key, description, type, default: defaultStr })
        return pre
    }, commonArr)

    const note = getCommandNote(commonArr, typeName)
    return note

}


export const getObjectTypeNote = (objectValue: { [key: string]: any }, addTypeName: string) => {
    if (hasProperty(objectValue, 'mock')) return ''
    if (hasProperty(objectValue, 'type') && objectValue.type === 'boolean') return 'boolean'
    const keys = Object.keys(objectValue)
    const commonArr = keys.map(key => { // TODO： 在不是正常的object对象处理
        const type = getSuitableType(objectValue[key])
        const defaultStr = getSuitableDefault(objectValue[key])
        const description = objectValue[key].description || ''
        return { key, type, description, default: defaultStr }
    })

    if(!commonArr. length) return ''
  
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
export const getArrayTypeNote = (arrayValue: any, addTypeName: string) => {
    if (!arrayValue.length && hasProperty(arrayValue, 'items')) { //  1、这里处理外部有一层Item
        const data = arrayValue.items
        if (hasProperty(data, 'type') && data.type === 'string') return 'string'
        if (hasProperty(data, 'type') && data.type === 'integer') return 'number'
        if (hasProperty(data, 'type') && data.type === 'number') return 'number'

        if (hasProperty(data, 'ordinal') && typeof data.ordinal === 'boolean') return 'string' // 后台状态字符创标志符
        const note = getNormalObjectNote(data, addTypeName)
        return note
    }

    const type = typeof arrayValue[0]
    if (type !== 'object') return type // 2、第二种情况处理

    const note = getUnNormalObjectNote(arrayValue, addTypeName) // 3、第三种情况处理
    return note
}


/** 处理第二层级的array和object */
export const getSecondNoteAndName = (value: any, addTypeName: string, type: string, appendNoteJsdocType: string) => {

    if (type.includes('array')) {
        const typeName = addTypeName.substring(0, addTypeName.length - 2)
        const addNote = getArrayTypeNote(value, typeName)

        if (addNote === 'string' || addNote === 'number') type = `${addNote}[]` // 处理字符串数组和特殊的api自动生成错误
        if (addNote.includes('@typedef')) { // 有正常序列的Jsdoc
            type = addTypeName
            if ('string, boolean, number'.includes(addNote)) type = `${addNote}[]`
            appendNoteJsdocType += addNote
        }
        if (addNote.includes('interface')) { // 有正常序列的TsType
            type = addTypeName
            if ('string, boolean, number'.includes(addNote)) type = `${addNote}[]`
            appendNoteJsdocType += addNote
        }

        if (!global.apiConfig.isNeedSecondType) {
            type = 'Array<any>'
            appendNoteJsdocType = ''
        }
    }
 

    if (type.includes('object')) {
        const addNote = getObjectTypeNote(value, addTypeName)
        if (addNote.startsWith('/**')) {
            appendNoteJsdocType = addNote
            type = addTypeName
        }
        if (addNote === 'boolean' || addNote === 'number') {
            appendNoteJsdocType = ''
            type = addNote
        }

        if (!global.apiConfig.isNeedSecondType) {
            type = 'Object'
            appendNoteJsdocType = ''
        }
   
    }

    return { note: appendNoteJsdocType, name: type }
}
