/** 获取请求注释上的param注释字符串 */
export const getNoteParams = (reqType: string, typeName: string, isGetMethod: boolean) => {
    if (!typeName.includes('[]') && !reqType) return ''
    return `\n   * @param {${typeName}} ${isGetMethod ? 'params' : 'data'}`
}

/** 获取文档地址 */
export const getApiLinkAddress = (baseUrl: string, project_id: number, _id: number) => {
    return `${baseUrl}/project/${project_id}/interface/api/${_id}`
}

export const getUpdateTime = (time: number) => new Date(time * 1000).toLocaleDateString()

export const getAppendIdNote = (params: Array<ReqParams>) => {
  
    return params.reduce((pre, curr) => {
        const { example, desc, name, _id } = curr
        if (_id) pre += `\n   * @param { number | string } ${name} ${desc}  example: ${example} `
        return pre
    }, '')
}