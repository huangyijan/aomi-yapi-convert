import { hasProperty, getTypeByValue } from '.'
/** 后台类型转前端类型 */
export const transformType = (serviceType: string) => {
    if (String(serviceType).length > 10) return 'any'
    switch (serviceType) {
        case 'integer':
            return 'number'
        case 'bool':
            return 'boolean'
        default:
            return serviceType
    }
}
/** 获取合适的参数类型 */
export const getSuitableType = (value: any) => {
    const valueType = typeof value
    switch (valueType) {
        case 'object':
            if(value === null) return 'any'
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

/** 获取合适的参数描述 */
export const getSuitDescription = (value: any) => {
    let description = ''
    if (hasProperty(value, 'description')) {
        description = value.description || ''
    }
    return description
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

export const getSuitableJsdocProperty = (key: string, type: string, description?: string, example?: string) => {
    const descriptionStr = description || ''
    const exampleStr = example? ` Example: ${example}`: ''
    return `  * @property { ${type} } [${key}] ${descriptionStr}${exampleStr} \n`
}

export const getSuitableJsdocType = (noteName: string, noteStr: string, childNote?: string) => `/** \n  * @typedef ${noteName}\n${noteStr}  */\n${childNote || ''}`


