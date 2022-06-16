import { getConfigNoteParams, getJsonToJsDocParams } from '../prompt/request/ts'
import { getNoteNameByParamsType, getReturnType } from '../prompt/note'
import { getLegalJson } from '.'
import { getReturnNoteStringItem } from '../prompt/response/ts'
import { getMainMethodItem, getNoteStringItem } from '../prompt/ts-type'


interface ParamsItem {
  name: string,
  typeName?: string,
  typeString?: string
}

interface ReturnData {
  name: string,
  typeName?: string,
  typeString?: string,
  childType?: Array<string>
}
const QueryParamsName = 'params'
const BodyParamsName = 'data'
const ReturnParamsName = 'response'


class ApiItem {
    public apiItem: JsDocApiItem
    public paramsArr: Array<ParamsItem>
    public returnData: ReturnData
    public methodNote: string
    public methodStr: string
    constructor(apiItem: JsDocApiItem) {
        this.apiItem = apiItem
        this.paramsArr = []
        this.methodStr = ''
        this.methodNote = ''
        this.returnData = {
            name: ReturnParamsName
        }

    }

}

class TsApiItem extends ApiItem {

    constructor(apiItem: JsDocApiItem) {
        super(apiItem)
        this.setParamsArr(apiItem)
        this.returnData = this.getReturnData(apiItem)
        this.methodNote = getNoteStringItem(apiItem)
    }

    private getReturnData(item: JsDocApiItem): ReturnData {
        const name = ReturnParamsName
        const { resType: typeString, returnNameWithType } = getReturnNoteStringItem(item)
        const typeName = getReturnType(returnNameWithType, typeString)
        return { name, typeName, typeString }
    }

    private getQueryData(item: JsDocApiItem): ParamsItem {
        const name = QueryParamsName
        const typeName = getNoteNameByParamsType(item)
        const typeString = getConfigNoteParams(item.req_query, typeName)
        return { name, typeName, typeString }
    }

    private getBodyData(item: JsDocApiItem): ParamsItem {
        const name = BodyParamsName
        const typeName = getNoteNameByParamsType(item)
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        const typeString = getJsonToJsDocParams(body, typeName)
        return { name, typeName, typeString }
    }

    private setParamsArr(item: JsDocApiItem) {
        const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
        if (hasParamsQuery) this.paramsArr.push(this.getQueryData(item))

        const hasParamsBody = item.req_body_other
        if (hasParamsBody) this.paramsArr.push(this.getBodyData(item))
    }

    public setMethodStr(project: ProjectConfig) {
        /** 重构，后续需要所有处理 */
        const paramsAny = this.paramsArr.find(item => !!item.typeString)
        this.methodStr = getMainMethodItem(this.apiItem, !!paramsAny, project, paramsAny?.typeName || 'any', this.returnData.typeName || 'any')
    }
}


export { TsApiItem }