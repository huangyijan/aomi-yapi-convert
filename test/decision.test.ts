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
        expect(getSuitableType(obj)).toEqual('any')
        const obj1 = {type: 'string'}
        expect(getSuitableType(obj1)).toEqual('string')
        const obj2 = { type: 'integer'}
        expect(getSuitableType(obj2)).toEqual('number')
        const obj3 = { type: 'bool'}
        expect(getSuitableType(obj3)).toEqual('boolean')

    })
})