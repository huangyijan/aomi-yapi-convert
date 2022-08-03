import { hasProperty, getTypeByValue } from '.'
import { NormalType, prettierDefaultOption } from './constants'
import prettier from 'prettier'
import { getUpperCaseName } from './str-operate'
/** 后台类型转前端类型 */
export const transformType = (serviceType: string) => {
    serviceType = String(serviceType)
    switch (serviceType) {
        case 'integer':
            return 'number'
        case 'text':
            return 'string'
        case 'bool':
            return 'boolean'
        default:
            if (NormalType.includes(serviceType.toLowerCase())) return serviceType
            else return 'any'
    }
}
/** 获取合适的参数类型 */
export const getSuitableType = (value: any) => {
    const valueType = typeof value
    switch (valueType) {
        case 'object':
            if (value === null) return 'any'
            if (hasProperty(value, 'type')) return transformType(value.type)
            if (hasProperty(value, 'default')) return getTypeByValue(value.default)
            return valueType
        case 'undefined':
            return 'any'
        case 'number':
        case 'string':
        default:
            return valueType
    }
}

/** 获取合适的参数描述 */
export const getSuitDescription = (value: any) => {
    let description = ''
    if (hasProperty(value, 'description')) {
        description = value.description || ''
    }
    return description
}

export const getSuitableDefault = (value: any) => {

    /** 如果是String类型的话没有多大必要显示Example: String. 多此一举了 */
    function removeTypeDefault(defaultStr: string) {
        if (String(defaultStr).trim().toLowerCase() === 'string') return ''
        return String(defaultStr)
    }

    const valueType = typeof value
    switch (valueType) {
        case 'object':
            if (hasProperty(value, 'default')) return removeTypeDefault(value.default)
            if (hasProperty(value, 'example')) return removeTypeDefault(value.example)
            return ''
        case 'boolean':
        case 'number':
            return String(value)
        case 'string':
            return removeTypeDefault(value)
        default:
            return ''
    }
}

export const getSuitableTsTypeNote = (description: string, example?: string) => {
    if (!description && !example) return ''
    const desc = description || ''
    const ex = example ? `   Example: ${example}` : ''
    return `    /**  ${desc}${ex}  */\n`
}


export const getSuitableTsType = (key: string, type: string) => {
    /** 剔除不合法的符号 */
    key = key.replace(/\W/g, '')
    return `${key}?: ${type}\n`
}

export const getSuitableJsdocProperty = (key: string, type: string, description?: string, example?: string) => {
    const descriptionStr = description || ''
    const exampleStr = example ? ` Example: ${example}` : ''
    return `  * @property { ${type} } [${key}] ${descriptionStr}${exampleStr} \n`
}

export const getSuitableTsInterface = (noteName: string, noteStr: string, childNote?: string) => `export interface ${noteName} {\n${noteStr}}\n${childNote || ''}`


export const getSuitableJsdocType = (noteName: string, noteStr: string, childNote?: string) => `/** \n  * @typedef ${noteName}\n${noteStr}  */\n${childNote || ''}`


/** 字符串拼接，缩进处理 */
export const format = (lines: string[]) => {
    const codeString = lines.join('\n')
    return prettier.format(codeString, prettierDefaultOption)
}

/** 获取Ts类型Str */
export const getTsTypeStr = (data: object) => {
    /** Ts数据机构处理json schema 数据结构, 由于存在内部调用，所以就写成了内部函数 */
    const getInterfaceType = (child: JsonSchema) => {
        let childType = getSuitableType(child)
        if (childType === 'object' && child?.properties) {
            childType = `{\n${getTsTypeStr(child.properties)}}`
        }
        if (childType === 'array' && child?.items) {
            childType = `Array<${getInterfaceType(child.items)}>`
        }
        return childType
    }

    let bodyStr = ''
    Object.entries(data).forEach(([key, value]) => {
        const description = getSuitDescription(value)
        const type = getInterfaceType(value)
        bodyStr += getSuitableTsTypeNote(description)
        bodyStr += getSuitableTsType(key, type)
    })
    return bodyStr
}

/** 通用处理JSON schema的数据结构，根据版本获取返回的type类型 */
export const dealJsonSchemaArr = (data: object, types: Types[], typeName: string) => {
    /** 处理json schema 数据结构, 由于存在内部调用，所以就写成了内部函数 */
    const getJsdocType = (child: JsonSchema, key: string) => {
        let childType = getSuitableType(child)
        if (childType === 'object' && child?.properties) {
            const keyName = typeName + getUpperCaseName(key)
            dealJsonSchemaArr(child.properties, types, keyName)
            childType = keyName
        }
        if (childType === 'array' && child?.items) {
            childType = `Array.<${getJsdocType(child.items, key)}>`
        }
        return childType
    }

    let bodyStr = ''
    Object.entries(data).forEach(([key, value]) => {
        const description = getSuitDescription(value)
        const type = getJsdocType(value, key)
        bodyStr += getSuitableJsdocProperty(key, type, description)

    })
    if (bodyStr.length) types.unshift({ typeName, typeString: bodyStr })
}