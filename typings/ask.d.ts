type OutVersion = 'ts' | 'js' | 'typescript' | 'javascript'

interface Answers {
  yapiURL?: string
  token?: string
  userId?: string
  isLoadFullApi?: boolean
  group?: Array<number>
  version: OutVersion,
  isNeedType: boolean,
  saveConfig?: boolean,
  outputDir?: string,
  runNow?: boolean
}

interface CatConfig {
  catId: number | string
  fileName?: string
  outputDir?: string
  name: string
}

interface ProjectConfig {
  projectId: number | string,
  outputDir: string,
  isLoadFullApi: boolean
  hideUnDoneApi?: boolean
  prefix?: string
  group?: Array<CatConfig>,
  customParams?: Array<CustomParam>
  /** 请求路径，自动生成 */
  requestUrl?: string,
  projectBaseConfig?: ProjectBaseConfig
}

interface CustomParam {
  name: string,
  default: string | number
}

interface ApiConfig {
  yapiURL?: string
  token?: string
  userId?: string
  version: OutVersion
  isNeedType: boolean
  isNeedAxiosType?: boolean
  isNeedSecondType?: boolean
  axiosFrom?: string
  axiosName?: string
  dataParseName?: string
  outputStyle?: string
  protocol: string
  host: string
  runNow?: boolean
  customerSnippet?: Array<string>
  customParams?: Array<CustomParam>
  projects: Array<ProjectConfig>
}

declare global: {
  var apiConfig: ApiConfig
  interface Window {
    global: {
    apiConfig: ApiConfig
  }}
}
