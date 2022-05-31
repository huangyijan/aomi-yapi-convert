
enum Version {
  JS = 'js',
  TS = 'ts'
}

interface Answers {
  yapiURL: string
  token?: string
  isLoadFullApi?: boolean
  group?: Array<number>
  version: Version,
  isNeedType: boolean,
  saveConfig?: boolean,
  outputDir?: string,
  runNow?: boolean
}

interface CatConfig {
  catId: number | string
  fileName: string
  outputDir: string
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
  yapiURL: string
  token?: string
  version: Version
  isNeedType: boolean
  isNeedAxiosType?: boolean
  axiosFrom: string
  axiosName?: string
  outputStyle?: string
  protocol: string
  host: string
  runNow?: boolean
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
