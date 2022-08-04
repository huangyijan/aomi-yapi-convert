import * as outputTemplate from '../src/utils/decision'
 
describe('utils decision', () => {
    const getSuitableType = outputTemplate.getSuitableType
    test(getSuitableType.name, () => {
        expect(getSuitableType('')).toEqual('string')
        expect(getSuitableType(1)).toEqual('number')
        expect(getSuitableType(true)).toEqual('boolean')
        expect(getSuitableType(undefined)).toEqual('any')
        expect(getSuitableType(null)).toEqual('any')
        const obj = {}
        expect(getSuitableType(obj)).toEqual('object')
        const obj1 = { type: 'string' }
        expect(getSuitableType(obj1)).toEqual('string')
        const obj2 = { type: 'integer' }
        expect(getSuitableType(obj2)).toEqual('number')
        const obj3 = { type: 'bool' }
        expect(getSuitableType(obj3)).toEqual('boolean')

    })

    const transformType = outputTemplate.transformType
    test(transformType.name, () => {
        expect(transformType('helloWorld')).toBe('any')
        expect(transformType('string')).toBe('string')
        expect(transformType('bool')).toBe('boolean')
        expect(transformType('boolean')).toBe('boolean')
        expect(transformType('integer')).toBe('number')
        expect(transformType('number')).toBe('number')
        expect(transformType('object')).toBe('object')
    })

    const getSuitDescription =outputTemplate.getSuitDescription
    test(getSuitDescription.name, () => {
        expect(getSuitDescription(null)).toBe('')
        expect(getSuitDescription(undefined)).toBe('')
        expect(getSuitDescription('any')).toBe('')
        expect(getSuitDescription({ description: 'hello' })).toBe('hello')
    })

    const getSuitableDefault = outputTemplate.getSuitableDefault
    test(getSuitableDefault.name, () => {
        expect(getSuitableDefault({ default: '0' })).toBe('0')
        expect(getSuitableDefault({ default: 111 })).toBe('111')
        expect(getSuitableDefault({ default: 'String' })).toBe('')
        expect(getSuitableDefault({ default: 'number' })).toBe('number')
        expect(getSuitableDefault(null)).toBe('')
        expect(getSuitableDefault(undefined)).toBe('')
        expect(getSuitableDefault('xxx')).toBe('xxx')
        expect(getSuitableDefault(1)).toBe('1')
        expect(getSuitableDefault('String')).toBe('')
    })

    const getSuitableTsTypeNote = outputTemplate.getSuitableTsTypeNote
    test(getSuitableTsTypeNote.name, () => {
        expect(getSuitableTsTypeNote('')).toBe('')
        expect(getSuitableTsTypeNote('商品描述').trim()).toBe('/**  商品描述  */')
        expect(getSuitableTsTypeNote('商品描述', '默认是1').trim()).toBe('/**  商品描述   Example: 默认是1  */')
    })

    const getSuitableTsType = outputTemplate.getSuitableTsType
    test(getSuitableTsType.name, () => {
        expect(getSuitableTsType('name', 'string').trim()).toBe('name?: string')
        expect(getSuitableTsType('name', 'number').trim()).toBe('name?: number')
    })

    /** 商品导出模板由于有换行符，所以就不加测试用例了 */

})
