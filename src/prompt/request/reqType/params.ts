
/** 获取请求参数（params）传输参数，考虑到params一律是传地址栏，所以type默认设置为string */
export const getConfigNoteParams = (reqQuery: Array<reqQuery>, requestName: string) => {
    let paramsStr = ''
    reqQuery.forEach(item => {
        paramsStr += `* @property {string} [${item.name}]   ${item.desc || ''} example: ${item.example || '无'} \n   `
    })

    if (!paramsStr) return ''
    return `/** 
   * @typedef ${requestName}
   ${paramsStr}*/`
}