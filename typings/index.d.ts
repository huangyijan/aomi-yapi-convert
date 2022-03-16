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
  // req_body_type: string,
  // res_body_type: string,
  // req_body_form: Array<ReqBodyForm>,
  // req_headers: Array<ReqHeaders>
  // req_params: Array<ReqParams>
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
  name: string,
  type: string,
  example: string,
  desc: string,
  required: string
}

declare interface ReqParams {
  name: string,
  example: string,
  desc: string
}

declare interface TimesObject {
  [key: string]: number
}