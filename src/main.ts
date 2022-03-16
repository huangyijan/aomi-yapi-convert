import { request } from "./request";

const baseUrl = `http://yapi.miguatech.com` // 基礎前綴
const demoUrl = '/api/interface/list?page=1&limit=200&project_id=445' // 接口分頁
const projectMenuUrl = '/api/interface/list_menu?project_id=445' // 菜單列表

interface MenuItem {
  index: number,
  parent_id: number,
  _id: number,
  name: string,
  project_id: number,
  desc: string,
  uid: number,
  add_tim: number,
  up_time: number,
  list: Array<apiSimpleItem>
  // req_body_type: string,
  // res_body_type: string,
  // req_body_form: Array<ReqBodyForm>,
  // req_headers: Array<ReqHeaders>
  // req_params: Array<ReqParams>
}
interface apiSimpleItem {
  edit_uid: number,
  status: string,
  index: number,
  tag: Array<any>,
  isFeign: number,
  _id: number,
  method: string,
  catid: number,
  title: string,
  path: string,
  project_id: string,
  uid: number,
  add_tim: number,
  up_time: number,
}
interface MenuList {
  errcode: number,
  errmsg: string,
  data: Array<MenuItem>
}

interface ReqBodyForm {
  name: string,
  type: string,
  example: string,
  desc: string,
  required: string
}

interface ReqHeaders {
  name: string,
  type: string,
  example: string,
  desc: string,
  required: string
}

interface ReqParams {
  name: string,
  example: string,
  desc: string
}

interface TimesObject {
  [key: string]: number
}

const LongPathNameRegex = /^\/([a-zA-Z0-9-_]+)\/.+/ // 长接口捕获路径名
const ShortPathNameRegex = /^\/([a-zA-Z0-9-_]+)/ // 短接口捕获路径名
const NameRegex = /[-|_]([a-zA-Z])/g // 重命名捕获替换字符串


/** 将下划线和短横线命名的重命名为驼峰命名法 */
const toHumpName = (str: string) => {
  return str.replace(NameRegex, function (_keb, item) { return item.toUpperCase(); })
}
/** 捕获路径名作为API文件夹名称 */
const getPathName = (path: string) => {
  let patchChunk: RegExpMatchArray  | null = null
  if (LongPathNameRegex.test(path)) {
    patchChunk = path.match(LongPathNameRegex)
  } else {
    patchChunk = path.match(ShortPathNameRegex)
  }
  if(!patchChunk) return 'common' // 捕获不到就用common作为路径文件夹
  return toHumpName(patchChunk[1])
}
const getMaxTimesObjectKeyName = (obj: TimesObject): string => {
  const times = Object.values(obj)
  const max = Math.max(...times)
  return Object.keys(obj).find(key => obj[key] === max) || 'common'
}

const getApiDoc = async (url: string) => {
  const fileString = await request(url) as any
  try {
    const MenuList = JSON.parse(fileString)
    const { data } = MenuList
    data.forEach((item: MenuItem) => {
      console.log(`当前构建菜单名称：${item.name}`);
      const { list } = item
      const pathSet: TimesObject = {} 
      list.forEach((item, index) => {
        console.log(`第${index+1}个接口拉取数据：`);
        console.log(`接口名称: ${item.title}`);
        console.log(`接口路径: ${item.path}`);
        const pathName = getPathName(item.path)
        console.log(`接口名：${getPathName(item.path)}`)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
      })
      console.log(`推荐使用菜单名： ${getMaxTimesObjectKeyName(pathSet)}`)

    });
  } catch (error) {
    console.log(error);
  }
  console.log(fileString);
}

getApiDoc(baseUrl + projectMenuUrl)

