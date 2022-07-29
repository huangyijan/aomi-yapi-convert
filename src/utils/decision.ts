import { hasProperty, getTypeByValue } from '.'
import { NormalType } from './constants'

/** 后台类型转前端类型 */
export const transformType = (serviceType: string) => {
    serviceType = String(serviceType)
    switch (serviceType) {
        case 'integer':
            return 'number'
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
            return String(valueType)
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


export const getSuitableTsType = (key: string, type: string) => `    ${key}?: ${type}\n`

export const getSuitableJsdocProperty = (key: string, type: string, description?: string, example?: string) => {
    const descriptionStr = description || ''
    const exampleStr = example ? ` Example: ${example}` : ''
    return `  * @property { ${type} } [${key}] ${descriptionStr}${exampleStr} \n`
}

export const getSuitableTsInterface = (noteName: string, noteStr: string, childNote?: string) => `interface ${noteName} {\n${noteStr}}\n${childNote || ''}`


export const getSuitableJsdocType = (noteName: string, noteStr: string, childNote?: string) => `/** \n  * @typedef ${noteName}\n${noteStr}  */\n${childNote || ''}`


/** 处理缩进 */
function withTab(code: string, tab: number, tabSize = 2) {
    const oneTab = Array(tabSize).fill(' ').join('')
    return Array(tab).fill(oneTab).join('') + code
}

/** 字符串拼接，缩进处理 */
export const format = (lines: string[], tabSize = 2) => {
    let tab = 0
    const codeString = lines.map(line => {
        if (line.trim().startsWith('}')) tab--
        const code = withTab(line, tab, tabSize)
        if (line.endsWith('{')) tab++
        return code
    })
        .join('\n')
    return codeString
}