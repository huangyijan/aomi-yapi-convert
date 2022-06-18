
import { getUpdateTime, getApiLinkAddress, getAxiosOptionTypeName, getReturnType, getNoteNameByParamsType } from './note'
import { getMainRequestMethodStr, getCustomerParamsStr } from '../utils/str-operate'
import { ApiItem } from '../utils/model'
import { getReturnNoteStringItem } from './response/ts'
import { getConfigNoteParams, getJsonToJsDocParams } from './request/ts'
import { getLegalJson } from '../utils'


class TsApiItem extends ApiItem {

    constructor(apiItem: JsDocApiItem, project: ProjectConfig) {
        super(apiItem, project)
        this.setParamsArr()
        this.setReturnData()
        this.setMethodNote()
        this.setMethodStr()
    }


    protected getIdsData(): ParamsItem[] {
        const item = this.apiItem
        return item.req_params.map(item => {
            return {
                name: item.name,
                typeName: 'string | number',
                description: item.desc,
                exInclude: true
            }
        })
    }
    protected getQueryData(): ParamsItem {
        const item = this.apiItem
        const name = 'params'
        const typeName = getNoteNameByParamsType(item, name)
        const typeString = getConfigNoteParams(item.req_query, typeName)
        return { name, typeName, typeString }
    }

    protected getBodyData(): ParamsItem {
        const item = this.apiItem
        const name = 'data'
        const typeName = getNoteNameByParamsType(item, name)
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        const typeString = getJsonToJsDocParams(body, typeName)
        return { name, typeName, typeString }
    }


    protected setReturnData(): void {
        const item = this.apiItem
        const name = 'response'
        const { resType: typeString, returnNameWithType } = getReturnNoteStringItem(item)
        const typeName = getReturnType(returnNameWithType, typeString)
        this.returnData = { name, typeName, typeString }
    }

    protected setParamsArr() {
        const item = this.apiItem

        this.paramsArr = this.paramsArr.concat(this.getIdsData())

        const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
        if (hasParamsQuery) this.paramsArr.push(this.getQueryData())

        const hasParamsBody = item.req_body_other
        if (hasParamsBody) this.paramsArr.push(this.getBodyData())

        this.paramsArr.push({
            name: 'options',
            typeName: getAxiosOptionTypeName(),
            exInclude: true
        })
    }

    private getAppendRequestParamsTsType() {
        const methodParamsStr = this.paramsArr.reduce((pre, cur, index) => {
            const typeStr = !global.apiConfig.isNeedType ? '' : `?: ${cur.typeName}`
            return pre += `${cur.name}${typeStr}${index === this.paramsArr.length - 1 ? '' : ', '}`
        }, '')
        return `(${methodParamsStr}${getCustomerParamsStr(this.project)})`
    }

    protected setMethodNote(): void {
        const item = this.apiItem
        this.methodNote =  `
  /**
   * @description ${item.title}
   * @apiUpdateTime ${getUpdateTime(item.up_time)}
   * @link ${getApiLinkAddress(item.project_id, item._id)}
   */`
    }


    protected setMethodStr() {
        const item = this.apiItem
        const requestParams = this.getAppendRequestParamsTsType()

        const appendParamsStr = this.paramsArr.reduce((pre, cur) => {
            if (cur.exInclude) return pre
            return pre += `${cur.name}, `
        }, '')
        this.methodStr = getMainRequestMethodStr(this.project, item, requestParams, appendParamsStr, this.returnData.typeName)
    }
}


export const handleTsTypeFileString = (fileBufferStringChunk: Array<string>, item: JsDocApiItem, project: ProjectConfig, noteStringChunk: Array<string>) => {
    const apiItem = new TsApiItem(item, project)

    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(apiItem.methodNote)
    fileBufferStringChunk.push(apiItem.methodStr)

    if (global.apiConfig.isNeedType) {
        apiItem.paramsArr.forEach(item => {
            if (item.typeString) noteStringChunk.push(item.typeString)
        })
        if (apiItem.returnData.typeString) noteStringChunk.push(apiItem.returnData.typeString)
    }
} 
