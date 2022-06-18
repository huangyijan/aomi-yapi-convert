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


export { ApiItem }