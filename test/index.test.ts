import { hasProperty, toHumpName, getTypeByValue } from "../src/utils";

describe('utils index', () => {
  test('hasProperty',  () => { 
    const userData = {name: 'yijian'}
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

  

})

