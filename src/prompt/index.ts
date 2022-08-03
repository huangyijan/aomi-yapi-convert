import { format } from '../utils/decision'
import { hasProperty, toHumpName } from '../utils'
import { ApiItem, FileItem } from '../utils/model'
import { JsApiItem } from './js/jsdoc'
import { getFileJsdocInfo } from '../utils/note'
import { TsApiItem } from './ts/ts-type'
import { axiosType, jsdocAxiosType, OutputStyle, Version, Versions } from '../utils/constants'


/** 获取合法可以被处理的接口path，有些接口可能不是很常规，这里处理异常情况 */
const getValidApiPath = (path: string) => {
    if (path.includes('?')) path = path.split('?')[0]
    if (path.endsWith('/')) path = path.slice(0, path.length - 1)
    return path
}

export class CommonFileItem extends FileItem {
    public config = global.apiConfig
    /** 已经取名的文件名 */
    private hasSaveNames: string[] = []
    /** 存储文件名的容器 */
    private fileNameSet: TimesObject = {}

    constructor(project: ProjectConfig, menu: JsDocMenuItem, hasSaveNames: string[]) {
        super(project, menu)
        this.hasSaveNames = hasSaveNames
        this.setFileHeader()
        this.dealExportDefault()
        this.setApiContent()
        this.setFileName()
        this.setSavePath()
    }

    protected setFileName(): void {
        const { list } = this.menuItem
        list.forEach((api) => {
            this.setFileNameTimes(api.path)
        })
        // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法
        const FileName = this.getMaxTimesObjectKeyName()
        this.fileName = FileName
        this.hasSaveNames.push(FileName)
    }

    /** 每个接口对象都统计一下出现次数 */
    private setFileNameTimes(path: string) { 
        path = path.replace(/\/{.+}/g, '')
        path = path.substring(1, path.length)
        const words = path.split('/')
        words.forEach(word => {
            word = toHumpName(word)
            word = word.replace(/^([A-Z])/, (_, item: string) => item.toLowerCase()) // 转下首字母小写
            this.fileNameSet[word] ? this.fileNameSet[word]++ : this.fileNameSet[word] = 1
        })
    }
    
    /** 获取独一的文件名称，如果名称都被用过了就用common文件做为文件名，这里可能会有多个common：TODO */
    private getMaxTimesObjectKeyName() {
        const obj = this.fileNameSet
        const sortKeyByTimes = Object.keys(obj).sort((key1, key2) => obj[key2] - obj[key1])
        const uinFileName = sortKeyByTimes.find(key => !this.hasSaveNames.includes(key)) || 'common'
        return uinFileName
    }

    protected setSavePath(): void {
        let fileName = this.fileName
        let dir = this.project.outputDir

        const fileConfig = this.fileConfig
        // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
        if (fileConfig && hasProperty(fileConfig, 'fileName') && fileConfig.fileName) fileName = fileConfig.fileName
        if (fileConfig && hasProperty(fileConfig, 'outputDir') && fileConfig.outputDir) dir = fileConfig.outputDir

        const { version } = this.config
        const path = `${dir}/${fileName}.${version}`
        this.savePath = path
    }

    /** 设置单个文件的文件头部信息 */
    protected setFileHeader(): void {

        this.fileHeader.push(getFileJsdocInfo(this.menuItem))
        if (Array.isArray(this.config.customerSnippet)) this.config.customerSnippet.forEach(str => this.fileHeader.push(str))

        if (Versions[this.config.version] === Version.TS) {
            this.config.isNeedType && this.config.isNeedAxiosType && this.fileHeader.push(axiosType)
        }
        if (this.config?.axiosFrom) this.fileHeader.push(this.config.axiosFrom)
        this.fileHeader.push('')
    }

    protected setApiContent(): void {
        const { list } = this.menuItem
        list.forEach((item) => {
            if (this.project.hideUnDoneApi && item.status === 'undone') return
            item.path = getValidApiPath(item.path) // 处理一些后台在地址栏上加参数的问题

            const apiItem: ApiItem = Versions[this.config.version] === Version.TS ? new TsApiItem(item, this.project) : new JsApiItem(item, this.project)

            this.apiContent.push(apiItem)
        })
    }

    protected setFileFoot(): void {
        if (Versions[this.config.version] === Version.JS && this.config.isNeedType) {
            this.fileFoot.push(jsdocAxiosType)
        }
    }

    /** 导出形式为默认的时候需要将整个对象包裹起来 */
    private dealExportDefault(): void {
        if (this.config.outputStyle === OutputStyle.Default) {
            this.fileHeader.push('export default {')
            this.fileFoot.push('}\n')
        }
    }

    public getFileCode(): string {
        if (!this.apiContent.length) return ''
        const mainContentStr: Array<string> = []
        this.apiContent.forEach(apiItem => {
            mainContentStr.push(apiItem.methodNote)
            mainContentStr.push(apiItem.methodStr)
            if (!this.config.isNeedType) return
            apiItem.paramsArr.forEach(item => {
                if (item.typeString) this.fileFoot.push(item.typeString)
            })
            if (apiItem.returnData.typeString) this.fileFoot.push(apiItem.returnData.typeString)
        })

        this.setFileFoot()
      
        return format(this.fileHeader.concat(mainContentStr, this.fileFoot))
    }

}
