/** 通用api对象的抽象类 */
abstract class ApiItem {

    public apiItem: JsDocApiItem
    public project: ProjectConfig
    public paramsArr: Array<ParamsItem>
    public returnData: ReturnData
    public methodNote: string
    public methodStr: string
    constructor(apiItem: JsDocApiItem, project: ProjectConfig) {
        this.apiItem = apiItem
        this.project = project
        this.paramsArr = []
        this.methodStr = ''
        this.methodNote = ''
        this.returnData = { name: 'response' }
    }

    /** 获取地址栏上的Id参数数组 */
    protected abstract getIdsData(): ParamsItem[]
    /** 获取接口Query类型的请求参数 */
    protected abstract getQueryData(): ParamsItem
    /** 获取接口Body类型的请求参数 */
    protected abstract getBodyData(): ParamsItem
    /** 设置单个接口的主要参数数组 */
    protected abstract setParamsArr(): void
    /** 设置单个接口的返回数据 */
    protected abstract setReturnData(): void
    /** 设置单个接口的主要请求注释字符串 */
    protected abstract setMethodNote(): void
    /** 设置单个接口的主要请求方法 */
    protected abstract setMethodStr(): void
}
/** 文件对象的抽象类 */
abstract class FileItem {
    public fileName = ''
    public savePath = ''
    public menuItem: JsDocMenuItem
    public project: ProjectConfig
    public fileHeader: Array<string> = []
    public apiContent: Array<ApiItem> = []
    public fileFoot: Array<string> = []
    public fileConfig: CatConfig | undefined

    constructor(project: ProjectConfig, menuItem: JsDocMenuItem) {
        this.project = project
        this.menuItem = menuItem

        if (menuItem.list.length) {
            this.fileConfig = this.project.group?.find(menu => menu.catId == menuItem.list[0].catid)
        }
    }
    /** 设置文件名称 */
    protected abstract setFileName(): void
    /** 设置文件保存路径 */
    protected abstract setSavePath(): void
    /** 设置文件头部信息 */
    protected abstract setFileHeader(): void
    /** 设置文件底部信息 */
    protected abstract setFileFoot(): void
    /** 设置文件文字信息 */
    protected abstract setApiContent(): void
    /** 获取文件输出字符串 */
    protected abstract getFileCode(): void
}

export { FileItem, ApiItem }