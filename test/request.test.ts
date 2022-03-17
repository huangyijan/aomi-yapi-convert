import { request } from './../src/utils/request'
import fs from 'fs'

const demoUrl = 'http://yapi.miguatech.com/api/interface/list?page=1&limit=20&project_id=445'

const getApiDoc = async (url: string) => {
  const data = await request(url) as any
  console.log(data)
  // fs.writeFile(
  //   SafePath('./api/api-code.json'),
  //   data,
  //   { encoding: 'utf-8' },
  //   (err) => {
  //   }
  // )
  return 1
}

getApiDoc(demoUrl)
test('request yapi docs', () => {
  expect('1').toBe(String(1))
})