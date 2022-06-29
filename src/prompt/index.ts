import { format } from '../utils/decision'
import { hasProperty } from '../utils'
import { ApiItem, FileItem } from '../utils/model'
import { JsApiItem } from './jsdoc'
import { getApiLinkAddress } from './note'
import { TsApiItem } from './ts-type'
import { axiosFrom, axiosType, eslintInfo, jsdocAxiosType, OutputStyle, tsInfo, Version } from '../utils/constants'


/** 获取头部jsdoc描述信息 */
const getFileJsdocInfo = (item: JsDocMenuItem) => {
    const menuItem = item.list.find(item => !!item)
    const menuLink = menuItem ? getApiLinkAddress(menuItem.project_id, `cat_${menuItem.catid}`) : ''
    return `
/**
 * @description ${item.name}
 * @file 该文件由aomi-yapi-convert自动生成，请不要手动改动这个文件, 可能会被插件更新覆盖
 * @docUpdateTime ${new Date().toLocaleDateString()}
 * @link ${menuLink}
 */`
}

/** 获取合法可以被处理的接口path，有些接口可能不是很常规，这里处理异常情况 */
const getValidApiPath = (path: string) => {
    if (path.includes('?')) path = path.split('?')[0]
    if (path.endsWith('/')) path = path.slice(0, path.length - 1)
    return path
}


class CommonFileItem extends FileItem {
    public config = global.apiConfig

    constructor(project: ProjectConfig, menu: JsDocMenuItem) {
        super(project, menu)
        this.setFileHeader()
        this.dealExportDefault()
        this.setApiContent()
    }

    /** 设置单个文件的文件头部信息 */
    protected setFileHeader(): void {

        this.fileHeader.push(getFileJsdocInfo(this.menuItem))
        this.fileHeader.push(eslintInfo)
        if (this.config.version === Version.TS) {
            this.fileHeader.push(tsInfo)
            this.config.isNeedAxiosType && this.fileHeader.push(axiosType)
        }
        if (hasProperty(this.config, 'axiosFrom')) this.fileHeader.push(this.config.axiosFrom || axiosFrom)
        this.fileHeader.push('')
    }

    protected setApiContent(): void {
        const { list } = this.menuItem
        list.forEach((item) => {
            if (this.project.hideUnDoneApi && item.status === 'undone') return
            item.path = getValidApiPath(item.path) // 处理一些后台在地址栏上加参数的问题

            const apiItem: ApiItem = this.config.version === Version.TS ? new TsApiItem(item, this.project) : new JsApiItem(item, this.project)

            this.apiContent.push(apiItem)
        })
    }

    protected setFileFoot(): void {
        if (this.config.version === Version.JS || this.config.isNeedType) {
            this.fileFoot.push(jsdocAxiosType)
        }
    }

    /** 导出形式为默认的时候需要将整个对象包裹起来 */
    private dealExportDefault(): void {
        if (!this.config.outputStyle || this.config.outputStyle === OutputStyle.Default) {
            this.fileHeader.push('export default {')
            this.fileFoot.push('}\n')
        }
    }

    public getFileCode(): string {
        if(!this.apiContent.length) return ''
        const mainContentStr: Array<string> = []
        this.apiContent.forEach(apiItem => {
            mainContentStr.push(apiItem.methodNote)
            mainContentStr.push(apiItem.methodStr)
            
            if (!global.apiConfig.isNeedType) return
            apiItem.paramsArr.forEach(item => {
                if (item.typeString) this.fileFoot.push(item.typeString)
            })
            if (apiItem.returnData.typeString) this.fileFoot.push(apiItem.returnData.typeString)
        })

        this.setFileFoot()
      
        return format(this.fileHeader.concat(mainContentStr, this.fileFoot))
    }

}

export { CommonFileItem }