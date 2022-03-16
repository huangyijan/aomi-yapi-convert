import { saveFile } from './saveFile';
import { getMaxTimesObjectKeyName, getPathName } from "./utils";
import { request } from "./request";
import format from './format';

const baseUrl = `http://yapi.miguatech.com` // 基礎前綴
const demoUrl = '/api/interface/list?page=1&limit=200&project_id=445' // 接口分頁
const projectMenuUrl = '/api/interface/list_menu?project_id=445' // 菜單列表

const ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g // 獲取接口名稱
const pathHasParamsRegex = /\{(.*)\}/g // 獲取接口名稱

const getOneApiConfig = (path: string) => {
  const dealNamePath = path.startsWith('/') ? path.substring(1) : path
  const isHaveName = pathHasParamsRegex.test(dealNamePath)
  let requestParams = '(options)'
  const requestPath = isHaveName ? `\`${path.replace(pathHasParamsRegex, (item, p1) => {
    requestParams = `(${p1}, options)`
    return `$${item}`
  })}\`` : `'${path}'`
  
  let requestName = dealNamePath.replace(ApiNameRegex, (_, item) => {
    return item.toUpperCase()
  })
  requestName = requestName.substring(requestName.length - 1) === '}' ? requestName.substring(0, requestName.length - 1) : requestName
  return { requestName, requestPath, requestParams }
}

const configApiFileBuffer = (fileBufferStringChunk: Array<string>) => {
  fileBufferStringChunk.unshift('export default {')
  fileBufferStringChunk.unshift(`import { fetch } from '@/service/fetch/index'`)
  fileBufferStringChunk.push('}')
  return format(fileBufferStringChunk)
}
const getPathSet = (list: Array<apiSimpleItem>) => {
  const pathSet: TimesObject = {} // 处理文件夹命名的容器
  const fileBufferStringChunk: Array<string> = []
  list.forEach((item) => {
    // 配置注釋
    fileBufferStringChunk.push(`/**
   * api: ${item.title}
   * updateTime: ${new Date(item.up_time*1000).toLocaleDateString()}
   */`)
    // 配置接口Item項
    const { requestName, requestPath, requestParams } = getOneApiConfig(item.path)
    fileBufferStringChunk.push(`${requestName}: ${requestParams} => {
    return fetch(${requestPath}, {
    ...options,
    method: '${item.method}'
    })
  },`)

    // 统计接口名
    const pathName = getPathName(item.path)
    pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
  })

  const fileBufferString = configApiFileBuffer(fileBufferStringChunk)
  return { pathSet, fileBufferString }
}


const getApiDoc = async (url: string) => {
  const fileString = await request(url) as any
  try {
    const MenuList = JSON.parse(fileString)
    const { data } = MenuList
    data.forEach((item: MenuItem) => {
      console.log(`当前构建菜单名称：${item.name}`);
      const { list } = item
      const { pathSet, fileBufferString } = getPathSet(list)

      const FileName = getMaxTimesObjectKeyName(pathSet)
      console.log(`推荐使用菜单名： ${FileName}`)
      saveFile(`./api/${FileName}.js`, fileBufferString)
    });
  } catch (error) {
    console.log(error);
  }
  console.log(fileString);
}

getApiDoc(baseUrl + projectMenuUrl)

