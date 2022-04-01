/** 普通网页的菜单接口 */
declare interface MenuItem {
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
}
declare interface apiSimpleItem {
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
declare interface MenuList {
  errcode: number,
  errmsg: string,
  data: Array<MenuItem>
}

declare interface ReqBodyForm {
  name: string,
  type: string,
  example: string,
  desc: string,
  required: string
}

declare interface ReqHeaders {
  _id: string
  name: string,
  type: string,
  example: string,
  desc: string,
  required: string
}

declare interface ReqParams {
  _id: number
  name: string,
  example: string,
  desc: string
}

declare interface TimesObject {
  [key: string]: number
}

interface requestConfig {
  requestName: string //api name str
  requestPath: string // api path str
  requestParams: string // api params str
}