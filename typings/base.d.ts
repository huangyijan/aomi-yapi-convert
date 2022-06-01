declare interface ProjectBaseConfig {
  add_time: number | string,
  basepath: string | string,
  desc: string,
  defaultRespBody: {
    [key: string]: any
  },
  env: Array<{
    header: any[],
    name: string,
    domain: string,
    name: string,
    _id: number|string
  }>,
  group_id: number,
  icon: string,
  is_json5: boolean,
  is_mock_open: false,
  name: string,
  role: string,
  project_type: string,
  tag: Array<any>,
  uid: number | string,
  up_time: number | string,
  _id: number
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
