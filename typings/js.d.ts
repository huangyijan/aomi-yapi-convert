
interface JsDocMenuItem {
  add_time: number
  name: string
  desc: string
  index: number
  parent_id: number
  add_time: number
  up_time: number
  list: Array<JsDocApiItem>
}

interface reqQuery {
  required: string
  name: string
  value: string
  example: string
  desc: string
  type: string
  _id: string
}
interface JsDocApiItem {
  __v: number
  _id: number
  add_time: number
  api_opened: false
  catid: number
  desc: string
  edit_uid: number
  index: number
  isFeign: number
  markdown: string
  method: string
  path: string
  project_id: number
  query_path: {
    params: Array
    path: string
  }
  req_query: Array<reqQuery>
  req_body_type: string
  req_body_other: string
  res_body: string
  res_body_type: string
  req_body_form: Array<ReqBodyForm>
  req_headers: Array<ReqHeaders>
  req_params: Array<ReqParams>
  req_body_is_json_schema: boolean
  status: string
  tag: Array
  title: string
  type: string
  uid: number
  up_time: number
}

interface Properties {
  [key: string]: {
    type: string
    default: string
    description: string
  }
}


interface keyNoteItem {
  key: string
  type: string
  description: string
  default?: string
}