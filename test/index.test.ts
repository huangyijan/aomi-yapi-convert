import { hasProperty, toHumpName, getTypeByValue } from '../src/utils'
 
describe('utils index', () => {
    test('hasProperty',  () => { 
        const userData = { name: 'yijian' }
        expect(hasProperty(userData, 'name')).not.toBeFalsy()
        expect(hasProperty(userData, 'sex')).toBeFalsy()
    
    })

    test('toHumpName', () => {
        const testName = 'you_are_good'
        const testName1 = 'you-are-good'
        const testName2 = '_you-are_good'
        const testName3 = '_you-are_good_'
        expect(toHumpName(testName)).toBe('youAreGood')
        expect(toHumpName(testName1)).toBe('youAreGood')
        expect(toHumpName(testName2)).toBe('YouAreGood')
        expect(toHumpName(testName3)).toBe('YouAreGood_')
    })

    test('getTypeByValue', () => {
        const value1 = 1
        const value2 = '1'
        const value3 = true
        const value4 = [1, 3]
        const value5 = { type: 'string' }
        const value6 = { name: 'yijian' }
        expect(getTypeByValue(value1)).toBe('number')
        expect(getTypeByValue(value2)).toBe('string')
        expect(getTypeByValue(value3)).toBe('boolean')
        expect(getTypeByValue(value4)).toBe('array')
        expect(getTypeByValue(value5)).toBe('object')
        expect(getTypeByValue(value6)).toBe('object')
    })

})

