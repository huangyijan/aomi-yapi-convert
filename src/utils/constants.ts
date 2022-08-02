import type { Options } from 'prettier'
/* eslint-disable no-useless-escape */
export const ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g // 獲取接口名稱
export const illegalRegex = /[^a-zA-Z0-9]/g // 用来剔除不合法的符号
export const longBiasRegex = /\/[^\/]*/ // 处理多个“/”地址的情况
export const pathHasParamsRegex = /\/\{([a-zA-Z0-9]*)\}/g // 獲取接口参数名稱

export const NormalType = ['boolean', 'string', 'number', 'object', 'array']

export const TOKEN_NAME = 'API_TOKEN'
export const USER_ID = 'YAPI_USER_ID'

export const NameRegex = /[-|_]([a-zA-Z])/g // 重命名捕获替换字符串
export const quotaRegex = /(,)\s*\n*.*\}/g // 匹配json字符串最后一个逗号
export const illegalJsonRegex = /(\/\/\s.*)\n/g // 非法json注释匹配
export const axiosFrom = 'import fetch from \'axios\''
export const axiosType = 'import type { AxiosRequestConfig } from \'aomi-yapi-convert\''
export const jsdocAxiosType = `/**
  * @typedef { import("aomi-yapi-convert").AxiosRequestConfig } AxiosRequestConfig
  */`

export const enum Version {
  JS = 'js',
  TS = 'ts'
}

/** 兼容简写与全写 */
export const Versions = {
    typescript: Version.TS,
    ts: Version.TS,
    javascript: Version.JS,
    js: Version.JS
}

/** api文件导出类型 */
export const enum OutputStyle {
  /** 默认导出 */
  Default = 'defaultExport',
  /** 具名导出 */
  Name = 'nameExport',
  /** 匿名导出 */
  Anonymous = 'anonymousExport'
}

export const baseConfig = {
    isNeedType: true,
    isNeedAxiosType: true,
    isNeedSecondType: true,
    outputStyle: OutputStyle.Default,
    axiosFrom: 'import fetch from \'axios\'',
    axiosName: 'fetch'
}

export const prettierDefaultOption: Options = {
    parser: 'typescript',
    semi: false,
    printWidth: 150,
    tabWidth: 4
}