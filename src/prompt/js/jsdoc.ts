
import { dealJsonToJsDocReturn, getConfigNoteParams, getJsonToJsDocParams } from '.'
import { getUpdateTime, getApiLinkAddress, getReturnType, getNoteNameByParamsType, getAxiosOptionTypeName } from '../../utils/note'
import { getCustomerParamsStr, getMainRequestMethodStr } from '../../utils/str-operate'
import { ApiItem } from '../../utils/model'
import { getLegalJson } from '../../utils'
import { getTypeName } from '../ts'
export class JsApiItem extends ApiItem {

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
        /** yapi 传body可能是form传输，也有可能是json传输，这里做一下兼容 */
        if (item.req_body_type === 'form') {
            const typeString = getConfigNoteParams(item.req_body_form, typeName)
            return { name, typeName, typeString }
        }
        const body = getLegalJson(item.req_body_other) // 获取合法的json数据
        const typeString = getJsonToJsDocParams(body, typeName)
        return { name, typeName, typeString }
    }

    protected setReturnData(): void {
        const item = this.apiItem
        const name = 'response'
        const interfaceName = getNoteNameByParamsType(item, name)
        const body = getLegalJson(item.res_body) // 获取合法的json数据
        const typeString = dealJsonToJsDocReturn(body, interfaceName)
        const typeName = getTypeName(interfaceName, body, typeString)
        this.returnData = { name, typeName, typeString }
    }

    protected setParamsArr(): void {
        const item = this.apiItem

        this.paramsArr = this.paramsArr.concat(this.getIdsData())

        const hasParamsQuery = Array.isArray(item.req_query) && Boolean(item.req_query.length)
        if (hasParamsQuery) this.paramsArr.push(this.getQueryData())

        const hasParamsBody = item.req_body_other || item.req_body_form.length
        if (hasParamsBody) this.paramsArr.push(this.getBodyData())

        const { isNeedAxiosType } = global.apiConfig
        this.paramsArr.push({
            name: 'options',
            typeName: isNeedAxiosType ? getAxiosOptionTypeName() : 'any',
            exInclude: true
        })
    }


    private getNoteParams() {
        let noteParamsStr = ''
        this.paramsArr.forEach(item => {
            if (!global.apiConfig.isNeedType && item.typeName === 'any') return 
            noteParamsStr += `\n * @param { ${item.typeName} } ${item.name}`
        })
        return noteParamsStr
    }

    private getReturnParamsStr() {
        if (!global.apiConfig.isNeedType) return ''
        return `\n * @return { Promise<${getReturnType(this.returnData.typeName, this.returnData.typeString)}> }`
    }

    protected setMethodNote(): void {
        const item = this.apiItem

        this.methodNote = `/**
 * @description ${item.title}${this.getNoteParams()}
 * @apiUpdateTime ${getUpdateTime(item.up_time)}
 * @link ${getApiLinkAddress(item.project_id, item._id)}${this.getReturnParamsStr()}
 */`
    }

    private getAppendRequestParamsJsdoc() {
        const methodParamsStr = this.paramsArr.reduce((pre, cur, index) => {
            return pre += `${cur.name}${index === this.paramsArr.length - 1 ? '' : ', '}`
        }, '')
        return `(${methodParamsStr}${getCustomerParamsStr(this.project)})`
    }

    protected setMethodStr(): void {
        const requestParams = this.getAppendRequestParamsJsdoc()
        const appendParamsStr = this.paramsArr.reduce((pre, cur) => {
            if (cur.exInclude) return pre
            return pre += `${cur.name}, `
        }, '')
        this.methodStr = getMainRequestMethodStr(this.project, this.apiItem, requestParams, appendParamsStr)
    }

}

