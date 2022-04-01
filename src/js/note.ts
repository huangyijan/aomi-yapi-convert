/** 获取请求注释上的param注释字符串 */
export const getNoteParams = (reqType: string, typeName: string, isGetMethod: boolean) => {
  if (!typeName) return ''
  return `\n   * @param {${typeName}} ${isGetMethod ? 'params' : 'data'}`
}

/** 获取文档地址 */
export const getApiLinkAddress = (baseUrl: string, project_id: number, _id: number) => {
  return `${baseUrl}/project/${project_id}/interface/api/${_id}`
}

export const getUpdateTime = (time: number) => new Date(time * 1000).toLocaleDateString()

