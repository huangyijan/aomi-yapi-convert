import { transformType, hasProperty, getTypeByValue } from '.'
export const getSuitableType = (value: any) => {
    const valueType = typeof value
    switch (valueType) {
    case 'object':
        if (hasProperty(value, 'type')) return transformType(value.type)
        if (hasProperty(value, 'default')) return getTypeByValue(value.default)
        return 'any'
    case 'undefined':
        return 'any'
    case 'number':
    case 'string':
    default:
        return String(valueType)
    }
}

export const getSuitableDefault = (value: any) => {
    const valueType = typeof value
    switch (valueType) {
    case 'object':
        if (hasProperty(value, 'default')) return value.default
        return ''
    case 'boolean':
    case 'string':
    case 'number':
        return String(valueType)
    default:
        return ''
    }
}

export const getSuitableTsTypeNote = (description: string, example?: string) => {
    if(!description && !example) return ''
    const desc = description || ''
    const ex = example? `   example: ${example}`: ''
    return `    /**  ${desc}${ex}  */\n`
}

export const getSuitableTsType = (key: string, type: string) => `    ${key}?: ${type}\n`

export const getSuitableTsInterface = (noteName: string, noteStr: string, childNote?: string) => `interface ${noteName} {\n${noteStr}}\n${childNote || ''}`