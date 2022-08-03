
import { getUpdateTime, getApiLinkAddress, getAxiosOptionTypeName, getNoteNameByParamsType } from '../../utils/note'
import { getMainRequestMethodStr, getCustomerParamsStr } from '../../utils/str-operate'
import { ApiItem } from '../../utils/model'
import { dealJsonToTsTypeReturn, getConfigNoteParams, getConfigNoteData, getTypeName } from '.'
import { getLegalJson } from '../../utils'


export class TsApiItem extends ApiItem {

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
        const interfaceName = getNoteNameByParamsType(item, name)
        /** yapi 传body可能是form传输，也有可能是json传输，这里做一下兼容 */
        if (item.req_body_type === 'form') {
            const typeString = getConfigNoteParams(item.req_body_form, interfaceName)
            return { name, typeName: interfaceName, typeString }
        }
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        const typeString = getConfigNoteData(body, interfaceName)
        const typeName = getTypeName(interfaceName, body, typeString)
        return { name, typeName, typeString }
    }


    protected setReturnData(): void {
        const item = this.apiItem
        const name = 'response'
        const interfaceName = getNoteNameByParamsType(item, name)
        const body = getLegalJson(item.res_body) // 获取合法的json数据
        const typeString = dealJsonToTsTypeReturn(body, interfaceName)
        const typeName = getTypeName(interfaceName, body, typeString)
        this.returnData = { name, typeName, typeString }
    }

    protected setParamsArr() {
        const item = this.apiItem

        this.paramsArr = this.paramsArr.concat(this.getIdsData())

        const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
        if (hasParamsQuery) this.paramsArr.push(this.getQueryData())

        const hasParamsBody = item.req_body_other || item.req_body_form.length
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
        this.methodNote =  `/**
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

