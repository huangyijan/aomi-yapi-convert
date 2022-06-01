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
